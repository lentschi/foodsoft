/* eslint-disable */
import { QueryCollection, QueryRelations } from './query-collection';
import 'reflect-metadata';
import { v1 as uuid } from 'uuid';
import { RecordNotFoundError } from './errors/record-not-found-error';
import { QueryOperator } from './operator-enum';

import camelcase from 'lodash-es/camelCase';
import { snakeCase } from 'lodash-es';
import { BehaviorSubject, Observable, Subject } from 'rxjs';
import { IDBIterator } from './idb-iterator';

export const enum ColumnType {
  numeric,
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
        case 'number': colType = ColumnType.numeric; break;
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

export function HasAndBelongsToMany(typeName: string) {
  return function(object: AppModel, propertyName: string) {
    const modelClass = <typeof AppModel> object.constructor;

    if (!modelClass.hasAndBelongsToManyRelations) {
      modelClass.hasAndBelongsToManyRelations = {};
    }
    modelClass.hasAndBelongsToManyRelations[propertyName] = <string>typeName;
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

    if (!constructor.hasAndBelongsToManyRelations) {
      constructor.hasAndBelongsToManyRelations = {};
    }

    if (!constructor.typeMap) {
      constructor.typeMap = {};
    }

    constructor.saved$ = new Subject<{previousModel?: AppModel, currentModel?: AppModel}>();

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

  static hasAndBelongsToManyRelations: {[propertyName: string]: string;};

  static modelRegistry: {[propertyName: string]: typeof AppModel;} = {};

  static saved$: Subject<{previousModel?: AppModel, currentModel?: AppModel}>;

  static db: IDBDatabase;

  static indexedProperties: string[];

  /**
   * the db table name
   */
  static tableName: string;

  static allowImplicitCreation: boolean;

  id: string;

  rawData: any;

  deleted = false;

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
   * Find model instance by a specific property
   * @param  {string}            propertyName the property's name
   * @param  {any}               value        the property's value
   * @return {Observable<extends AppModel>}   an observable that emits the matching AppModel or undefined whenever it has been changed/deleted
   */
   static findBy$<T extends AppModel, K extends keyof T>(this: (new () => T) & typeof AppModel, propertyName: K, value: T[K], include?: QueryRelations<keyof T>): Observable<T | undefined> {
    const collection = this.all<T>()
      .filter(propertyName, QueryOperator.equal, value);

    if (include !== undefined) {
      collection.include(include);
    }

    return collection.one$();
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

  static async createFromIndexedDbResult<T extends AppModel>(this: typeof AppModel, data: T, relationsToLoad: QueryRelations<keyof T> = new Map()): Promise<T> {
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
      const hasOneId = modelInstance[<keyof T> `${propertyName}Id`];
      if (!loadRelationsMap || hasOneId == null) {
        continue;
      }

      const relationName: string = this.hasOneRelations[propertyName];
      const relatedModelClass = AppModel.getModelClass(relationName);
      (<AppModel> <unknown> modelInstance[<keyof T> propertyName]) = await relatedModelClass
        .all()
        .include(loadRelationsMap)
        .filter('id', QueryOperator.equal, hasOneId)
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

    for (const propertyName of Object.keys(this.hasAndBelongsToManyRelations)) {
      const loadRelationsMap = <QueryRelations<keyof AppModel>> relationsToLoad.get(<keyof T> propertyName);
      if (!loadRelationsMap) {
        continue;
      }

      const relationName: string = this.hasAndBelongsToManyRelations[propertyName];
      const relatedModelClass = AppModel.getModelClass(relationName);
      (<AppModel[]> <unknown> modelInstance[<keyof T> propertyName]) = await modelInstance
        .listHabtmReleated(relatedModelClass);
    }

    return modelInstance;
  }

  public static unmarshalServerData<T extends AppModel>(this: typeof AppModel, modelData: Partial<T>): T {
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

      const relatedHasOneModelName = this.hasOneRelations[<string> targetKey];
      if (relatedHasOneModelName !== undefined && typeof value === 'object' && value !== null) {
        const relatedHasOneModelClass = AppModel.getModelClass(relatedHasOneModelName);
        (<AppModel> <unknown> model[targetKey]) = relatedHasOneModelClass.unmarshalServerData(<Partial<AppModel>> (key in value ? (<any> value)[key] : value));
        if (`${targetKey}Id` in this.typeMap) {
          (<any> model[<keyof T> `${targetKey}Id`]) = (<any> model[targetKey]).id;
        }
        continue;
      }

      const relatedHasManyModelName = this.hasManyRelations[<string> targetKey] || this.hasAndBelongsToManyRelations[<string> targetKey];
      if (relatedHasManyModelName !== undefined && Array.isArray(value)) {
        const relatedHasManyModelClass = AppModel.getModelClass(relatedHasManyModelName);
        const targetArray: AppModel[] = [];
        (<any> model[targetKey]) = targetArray;
        for (const hasManyValue of value) {
          const subKey = snakeCase(relatedHasManyModelName);
          const hasManyModel = relatedHasManyModelClass.unmarshalServerData(<Partial<AppModel>> (subKey in hasManyValue ? hasManyValue[subKey] : hasManyValue));
          targetArray.push(hasManyModel);
        }

        continue;
      }

      if (key === 'id' && typeof value === 'number') {
        model.id = this.serverToIndexDbId(value);
        continue;
      }

      if (targetKey in this.typeMap) {
        switch (this.typeMap[<string> targetKey]) {
          case ColumnType.date:
            (<Date | undefined> <unknown> model[targetKey]) = value ? new Date(<string> <unknown> value) : undefined;
            continue;
          case ColumnType.numeric:
            (<number | undefined> <unknown> model[targetKey]) = value ? Number(<string> <unknown> value) : undefined;
            continue;
          default:
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            (<any> model[targetKey]) = (value === null) ? undefined : value;
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
  async save(): Promise<void> {
    if (this.deleted) {
      throw new Error('Cannot save deleted model instance');
    }

    const modelClass = <typeof AppModel> this.constructor;

    const previousModel = this.rawData ? await modelClass.createFromIndexedDbResult(<AppModel> this.rawData) : undefined;

    // indexedDB:
    await new Promise<void>(async (resolve, reject) => {
      const data: unknown = {};
      for (const propertyName of Object.keys(modelClass.typeMap)) {
        const propertyValue = this[<keyof this> propertyName];
        const propertyType = modelClass.typeMap[propertyName];
        (<any> data)[propertyName] = modelClass.convertToIndexedDbValue(propertyValue, propertyType);
      }

      const transaction = modelClass.db
        .transaction([modelClass.tableName], 'readwrite');
      const store = transaction.objectStore(modelClass.tableName);

      // const idBefore = this.id;
      this.id = this.id || uuid();
      // console.log(`DB:${modelClass.tableName}:PUT`, idBefore, this.id, data);
      store.put(data, this.id);

      transaction.oncomplete = (): void => resolve();
      transaction.onerror = (e):void => reject(e);
    });

    modelClass.saved$.next({previousModel, currentModel: this});
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

  private async listHabtmReleated(relatedModelClass: typeof AppModel): Promise<Array<AppModel>> {
    const modelClass = <typeof AppModel> this.constructor;
    const tableName = getHabtmTableName(modelClass, relatedModelClass);
    const transaction = modelClass.db
      .transaction([tableName], 'readonly');
    const store = transaction.objectStore(tableName);
    const idColumnName = getIdColumnName(modelClass);
    const index = store.index(idColumnName);
    const iterator = new IDBIterator(index, IDBKeyRange.only(this.id));
    const relatedInstanceIds: string[] = [];
    for await (const habtmData of iterator) {
      const id = (<any> habtmData)[getIdColumnName(relatedModelClass)];
      relatedInstanceIds.push(id);
    }

    const relatedInstances: Array<AppModel> = [];
    for (const id of relatedInstanceIds) {
      relatedInstances.push(await relatedModelClass.findBy('id', id));
    }
    return relatedInstances;
  }

  async addHabtmRelation(relatedModel: AppModel): Promise<void> {
    await new Promise<void>(async (resolve, reject) => {
      const modelClass = <typeof AppModel> this.constructor;
      const relatedModelClass = <typeof AppModel> relatedModel.constructor;
      const tableName = getHabtmTableName(modelClass, relatedModelClass);
      const transaction = modelClass.db
          .transaction([tableName], 'readwrite');

      const store = transaction.objectStore(tableName);

      const data: any = {};
      data[getIdColumnName(modelClass)] = this.id;
      data[getIdColumnName(relatedModelClass)] = relatedModel.id;

      const keyComponents = [this.id, relatedModel.id];
      if (modelClass.tableName > relatedModelClass.tableName) {
        keyComponents.reverse();
      }

      store.put(data, keyComponents.join('_'));

      transaction.oncomplete = (): void => resolve();
      transaction.onerror = (e):void => reject(e);
    });
  }

  async removeAllHabtmRelations(relatedModelClass: typeof AppModel): Promise<void> {
    const relatedModels = await this.listHabtmReleated(relatedModelClass);
    const firstRelatedModel = relatedModels[0];
    if (firstRelatedModel === undefined) {
      return;
    }


    await new Promise<void>(async (resolve, reject) => {
      const modelClass = <typeof AppModel> this.constructor;
      const relatedModelClass = <typeof AppModel> firstRelatedModel.constructor;
      const tableName = getHabtmTableName(modelClass, relatedModelClass);
      const transaction = modelClass.db
          .transaction([tableName], 'readwrite');

      const store = transaction.objectStore(tableName);

      for (const relatedModel of relatedModels) {
        const keyComponents = [this.id, relatedModel.id];
        if (modelClass.tableName > relatedModelClass.tableName) {
          keyComponents.reverse();
        }

        store.delete(keyComponents.join('_'));
      }

      transaction.oncomplete = (): void => resolve();
      transaction.onerror = (e):void => reject(e);
    });
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
    return modelClass.indexedDbToServerId(this.id);
  }

  static indexedDbToServerId(id: string): number {
    const md = id.match(new RegExp(`^${this.tableName}-([0-9]+)$`, 'u'));
    if (!md) {
      throw new Error(`${this.tableName} model instance has no server id`);
    }

    return parseInt(md[1], 10);
  }

  static serverToIndexDbId(serverId: number): string {
    return `${this.tableName}-${serverId}`;
  }

}

function getHabtmTableName(modelClass: typeof AppModel, relatedModelClass: typeof AppModel): string {
  return `${[modelClass.tableName, relatedModelClass.tableName].sort().join('')}_habtm`;
}

function getIdColumnName(modelClass: typeof AppModel): string {
  return `${modelClass.tableName.charAt(0).toLowerCase()}${modelClass.tableName.slice(1)}Id`
}
