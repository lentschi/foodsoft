/* eslint-disable */
import { QueryCollection, QueryRelations } from './query-collection';
import 'reflect-metadata';
import { v1 as uuid } from 'uuid';
import { RecordNotFoundError } from './errors/record-not-found-error';
import { QueryOperator } from './operator-enum';

import camelcase from 'lodash-es/camelCase';

export const enum ColumnType {
  integer,
  boolean,
  text,
  date,
  json
}

export function Column(colType?: ColumnType) {
  return function(object: any, propertyName: string) {
    if (!colType) {
      const meta = Reflect.getMetadata('design:type', object, propertyName);

      // const meta = {name: 'STRING'};
      const typeName: string = meta.name.toLowerCase();
      switch (typeName) {
        case 'number': colType = ColumnType.integer; break;
        case 'boolean': colType = ColumnType.boolean; break;
        case 'string': colType = ColumnType.text; break;
        case 'date': colType = ColumnType.date; break;
        case 'object': colType = ColumnType.json; break;
        default: throw new Error(`persistencejs Column: Could not map type ${typeName} of column ${object.constructor.tableName}.${propertyName}`);
      }
    }
    if (!object.constructor.typeMap) {
      object.constructor.typeMap = [];
    }
    object.constructor.typeMap[propertyName] = colType;
  };
}

export function HasOne(typeName?: string) {
  return function(object: AppModel, propertyName: string) {
    if (!typeName) {
      const meta = Reflect.getMetadata('design:type', object, propertyName);
      typeName = meta.name;
    }

    const modelClass = <typeof AppModel> object.constructor;

    if (!modelClass.hasOneRelations) {
      modelClass.hasOneRelations = {};
    }
    modelClass.hasOneRelations[propertyName] = <string>typeName;
  };
}


export function HasMany(typeName: string) {
  return function(object: AppModel, propertyName: string) {
    const modelClass = <typeof AppModel> object.constructor;

    if (!modelClass.hasManyRelations) {
      modelClass.hasManyRelations = {};
    }
    modelClass.hasManyRelations[propertyName] = <string>typeName;
  };
}

export function PersistenceModel(tableName: string) {
  return (constructor: typeof AppModel) => {
    constructor.tableName = tableName;

    if (!constructor.hasOneRelations) {
      constructor.hasOneRelations = {};
    }

    if (!constructor.hasManyRelations) {
      constructor.hasManyRelations = {};
    }


    AppModel.register(constructor.tableName, constructor);
  }
}


/**
 * ORM representation of a db table
 */
export class AppModel {
  static typeMap: {[propertyName: string]: ColumnType;};

  static hasOneRelations: {[propertyName: string]: string;};

  static hasManyRelations: {[propertyName: string]: string;};

  static modelRegistry: {[propertyName: string]: typeof AppModel;} = {};

  static db: IDBDatabase;

  static indexedProperties: string[];

  /**
   * the db table name
   */
  static tableName: string;

  static allowImplicitCreation: boolean;

  id: string;

  rawData: any;

  private deleted = false;

  static register(modelName: string, modelClass: typeof AppModel): void {
    this.modelRegistry[modelName] = modelClass;
  }

  static getModelClass(modelName: string): typeof AppModel {
    return this.modelRegistry[modelName];
  }

  /**
   * Retrieve query collection for the model
   * @return {QueryCollection} the model's query collection
   */
  static all<T extends AppModel>(this: (new () => T) & typeof AppModel): QueryCollection<T> {
    // TODO: check https://stackoverflow.com/questions/34098023/typescript-self-referencing-return-type-for-static-methods-in-inheriting-classe
    return new QueryCollection<T>(this.db, this);
  }

  /**
   * Find model instance by a specific property value
   * @param  {string}            propertyName the property's name
   * @param  {any}               value        the property's value
   * @return {Promise<extends AppModel>}      an AppModel instance for the record retrieved from the db
   */
  static findBy<T extends AppModel, K extends keyof T>(this: (new () => T) & typeof AppModel, propertyName: K, value: T[K]): Promise<T> {
    return this.all<T>()
      .filter(propertyName, QueryOperator.equal, value)
      .one();
  }

  /**
   * See [[AppModel.findBy]], but if no matching record can be found, one is created
   */
  static findOrCreateBy<T extends AppModel, K extends keyof T>(this: (new () => T) & typeof AppModel, propertyName: K, value: T[K]): Promise<T> {
    return new Promise(async resolve => {
      let modelInstance: T;
      try {
        modelInstance = await this.findBy<T, K>(propertyName, value);
      } catch (e) {
        modelInstance = <T> new this();
        modelInstance[propertyName] = value;
      }

      resolve(modelInstance);
    });
  }

  static async createFromIndexedDbResult<T extends AppModel>(this: typeof AppModel, data: T, relationsToLoad: QueryRelations<keyof T>): Promise<T> {
    if (!data) {
      throw new Error('Cannot create instance with no data');
    }
    const modelInstance = <T> new this();
    modelInstance.id = data.id;
    modelInstance.rawData = data;
    for (const propertyName of Object.keys(this.typeMap)) {
      const propertyType = this.typeMap[propertyName];
      if (propertyType === ColumnType.boolean) {
        (<boolean> <unknown> modelInstance[<keyof T> propertyName]) = (<number> <unknown>data[<keyof T> propertyName]) === 1;
      } else {
        modelInstance[<keyof T> propertyName] = data[<keyof T> propertyName];
      }
    }

    for (const propertyName of Object.keys(this.hasOneRelations)) {
      const loadRelationsMap = <QueryRelations<keyof AppModel>> relationsToLoad.get(<keyof T> propertyName);
      if (!loadRelationsMap) {
        continue;
      }

      const relationName: string = this.hasOneRelations[propertyName];
      const relatedModelClass = AppModel.getModelClass(relationName);
      (<AppModel> <unknown> modelInstance[<keyof T> propertyName]) = await relatedModelClass
        .all()
        .include(loadRelationsMap)
        .filter('id', QueryOperator.equal, modelInstance[<keyof T> `${propertyName}Id`])
        .one();
    }

    for (const propertyName of Object.keys(this.hasManyRelations)) {
      const loadRelationsMap = <QueryRelations<keyof AppModel>> relationsToLoad.get(<keyof T> propertyName);
      if (!loadRelationsMap) {
        continue;
      }

      const relationName: string = this.hasManyRelations[propertyName];
      const relatedModelClass = AppModel.getModelClass(relationName);
      (<AppModel[]> <unknown> modelInstance[<keyof T> propertyName]) = await relatedModelClass
        .all()
        .include(loadRelationsMap)
        .filter(<keyof AppModel> `${this.tableName.charAt(0).toLowerCase()}${this.tableName.slice(1)}Id`, QueryOperator.equal, modelInstance.id)
        .list();
    }

    return modelInstance;
  }

  public static unmarshalServerData<T extends AppModel>(this: typeof AppModel, modelData: Partial<T>) {
    const model = <T> new this();
    // eslint-disable-next-line prefer-destructuring
    for (const key of Object.keys(modelData)) {
      const value = modelData[<keyof T> key];
      const targetKey = <keyof T> camelcase(key);

      const md = key.match(/(.+)_id/u);
      if (md && typeof value === 'number') {
        const relatedModelProperty = camelcase(md[1]);
        const relatedModelName = this.hasOneRelations[relatedModelProperty];
        (<any> model[targetKey]) = relatedModelName !== undefined ? `${relatedModelName}-${value}` : value;

        continue;
      }

      const relatedModelName = this.hasOneRelations[<string> targetKey];
      if (relatedModelName !== undefined) {
        const relatedModelClass = AppModel.getModelClass(relatedModelName);
        (<AppModel> <unknown> model[targetKey]) = relatedModelClass.unmarshalServerData(<Partial<AppModel>> (key in value ? (<any> value)[key] : value));
        if (`${targetKey}Id` in this.typeMap) {
          (<any> model[<keyof T> `${targetKey}Id`]) = (<any> model[targetKey]).id;
        }
        continue;
      }

      if (key === 'id' && typeof value === 'number') {
        model.id = `${this.tableName}-${value}`;
        continue;
      }

      if (key in this.typeMap) {
        switch (this.typeMap[key]) {
          case ColumnType.date:
            (<Date | undefined> <unknown> model[targetKey]) = value ? new Date(<string> <unknown> value) : undefined;
            continue;
          default:
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            (<any> model[targetKey]) = value;
            continue;
        }
      }
    }
    return model;
  }

  static convertToIndexedDbValue(value: unknown, propertyType?: ColumnType): unknown {
    if (typeof value === 'boolean' || propertyType === ColumnType.boolean) {
      return value ? 1 : 0;
    }

    return value;
  }

  /**
   * Creates/updates record in the db matching the instance's data
   * @return {Promise<void>} resolved as soon as the record has been updated/created
   */
  save(): Promise<void> {
    if (this.deleted) {
      throw new Error('Cannot save deleted model instance');
    }

    const modelClass = <typeof AppModel> this.constructor;

    // indexedDB:
    return new Promise(async (resolve, reject) => {
      const data: unknown = {};
      for (const propertyName of Object.keys(modelClass.typeMap)) {
        const propertyValue = this[<keyof this> propertyName];
        const propertyType = modelClass.typeMap[propertyName];
        (<any> data)[propertyName] = modelClass.convertToIndexedDbValue(propertyValue, propertyType);
      }

      const transaction = modelClass.db
        .transaction([modelClass.tableName], 'readwrite');
      const store = transaction.objectStore(modelClass.tableName);

      const idBefore = this.id;
      this.id = this.id || uuid();
      console.log(`DB:${modelClass.tableName}:PUT`, idBefore, this.id, data);
      store.put(data, this.id);

      transaction.oncomplete = (): void => resolve();
      transaction.onerror = (e):void => reject(e);
    });
  }

  /**
   * Remove the db record referenced by the instance
   */
  async delete() {
    this.deleted = true;
    const modelClass = <typeof AppModel> this.constructor;
    const affectedItems = await modelClass
      .all()
      .filter('id', QueryOperator.equal, this.id)
      .delete();

    if (affectedItems !== 1) {
      throw new RecordNotFoundError();
    }
  }

  clone(): this {
    const modelClass = <typeof AppModel> this.constructor;
    const copy = <this> new modelClass();

    // copy fields:
    for (const propertyName of Object.keys(modelClass.typeMap)) {
      copy[<keyof this> propertyName] = this[<keyof this> propertyName];
    }

    // copy relations:
    for (const propertyName of Object.keys(modelClass.hasOneRelations)) {
      copy[<keyof this> propertyName] = this[<keyof this> propertyName];
    }

    return copy;
  }

  get serverId(): number {
    const modelClass = <typeof AppModel> this.constructor;
    const md = this.id.match(new RegExp(`^${modelClass.tableName}-([0-9]+)$`, 'u'));
    if (!md) {
      throw new Error(`${modelClass.tableName} model instance has no server id`);
    }

    return parseInt(md[1], 10);
  }
}

