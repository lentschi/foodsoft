/* eslint-disable */
import { IDBIterator } from './idb-iterator';
import { AppModel } from './app-model';
import { RecordNotFoundError } from './errors/record-not-found-error';
import { QueryOperator } from './operator-enum';
import { combineLatest, from, Observable, of } from 'rxjs';
import { concatMap, filter, map, startWith, switchMap } from 'rxjs/operators';

export type QueryRelations<T> = Map<T, QueryRelations<string>>;
export type QueryFilter<T> = {property: keyof T; operator: QueryOperator; value: unknown;};

export class QueryCollection<T extends AppModel> {
  private relationsToLoad: QueryRelations<keyof T> = new Map<keyof T, QueryRelations<string>>();

  private filters: QueryFilter<T>[] = [];

  private sortBy: {property: keyof T; descending: boolean;};

  constructor(private db: IDBDatabase, private modelClass: typeof AppModel) {
    if (modelClass.tableName == null) {
      throw new Error(`Missing @PersistenceModel class decorator for:\n${modelClass}\n`);
    }
  }

  order<PropertyKey extends keyof T>(property: PropertyKey, descending = false): QueryCollection<T> {
    if (this.sortBy) {
      throw new Error('Cannot sort by multiple fields');
    }

    this.sortBy = { property, descending };

    return this;
  }

  filter<PropertyKey extends keyof T>(property: PropertyKey, operator: QueryOperator, value: T[PropertyKey]): QueryCollection<T> {
    this.filters.push({ property, operator, value });
    return this;
  }

  public getSingle(id: string): Promise<T> {
    return new Promise<T>((resolve, reject) => {
      const transaction = this.db
        .transaction([this.modelClass.tableName], 'readonly');
      const store = transaction.objectStore(this.modelClass.tableName);
      const request = store.get(id);
      transaction.oncomplete = (): void => {
        if (request.result !== undefined) {
          resolve(this.modelClass.createFromIndexedDbResult({...request.result, id}, this.relationsToLoad));
        } else {
          console.error('Record not found', id);
          reject(new RecordNotFoundError());
        }
      };
      transaction.onerror = (e): void => reject(e);
    });
  }

  public list$(): Observable<Array<T>> {
    const listCache = new Map<string, T>();

    return this.modelClass.saved$.pipe(
      filter(change => this.filtersMatch(this.filters, change.currentModel ?? {}) || this.filtersMatch(this.filters, change.previousModel ?? {})),
      startWith(undefined),
      switchMap(change => from(this.getList()).pipe(
        switchMap(async (list) => {
          const mappedItems: T[] = [];
          for (const item of list) {
            mappedItems.push(await this.modelClass.createFromIndexedDbResult(item, this.relationsToLoad));
          }
          return mappedItems;
        }),
        map(list => {
          for (const [id, cachedModel] of listCache.entries()){
            const index = list.findIndex(model => model.id === id && (change?.currentModel === undefined || model.id !== change.currentModel.id));
            if (index !== -1) {
              list.splice(index, 1, cachedModel);
            }
          }
          listCache.clear();
          for (const model of list) {
            listCache.set(model.id, model);
          }
          return list;
        })
      )),
    );
  }


  private async getList(): Promise<Array<T>> {
    const idFilter = this.getIdFilter();
    if (idFilter) {
      const result = await this.getSingle((<any> idFilter.value).toString());
      return result ? [{ ...result, id: idFilter.value }] : [];
    }

    const transaction = this.db
      .transaction([this.modelClass.tableName], 'readonly');
    const store = transaction.objectStore(this.modelClass.tableName);

    // Filter:
    let index: IDBIndex;
    let key: IDBKeyRange | undefined;
    const applicableFilters = this.filters
      .filter(filter => filter.operator === QueryOperator.equal &&
          typeof filter.value !== 'undefined' &&
          filter.value !== null &&
          (!this.sortBy || this.sortBy.property === filter.property));

    let indexName: string;
    if (applicableFilters.length > 0) {
      if (this.sortBy) {
        throw new Error('Sorting and filtering at the same time currently not implemented');;
      }
      indexName = applicableFilters
        .map(filter => String(filter.property))
        .join('-');

      try {
        index = store.index(indexName);
      } catch (e) {
        console.error('Could not index ', this.modelClass.tableName, indexName, applicableFilters);
        throw e;
      }

      const onlyValue: any = applicableFilters.length === 1
        ? this.modelClass.convertToIndexedDbValue(applicableFilters[0].value)
        : applicableFilters.map(filter => this.modelClass.convertToIndexedDbValue( filter.value));
      try {
        key = IDBKeyRange.only(onlyValue);
      } catch (e) {
        console.error('Could not create index key ', onlyValue, this.modelClass.tableName, indexName, applicableFilters, e);
        throw e;
      }
    } else if (this.sortBy) {
      try {
        index = store.index(String(this.sortBy.property));
      } catch (e) {
        console.error('Could not index for sorting', this.modelClass.tableName, this.sortBy);
        throw e;
      }
    }

    // Fetch:
    const iterator = new IDBIterator(index! || store, key, this.sortBy && this.sortBy.descending ? 'prev' : 'next');
    const ret: Array<any> = [];
    const remainingFilters = this.filters
      .filter(filter => !applicableFilters.includes(filter));
    for await (const item of iterator) {
      if (this.filtersMatch(remainingFilters, item)) {
        ret.push(item);
      }
    }
    // console.log(
    //   `DB:${this.modelClass.tableName}:FETCH`,
    //   this.filters.map(filter => filter.property + filter.operator + filter.value).join(' && '),
    //   ret
    // );
    return ret;
  }

  private getIdFilter(): QueryFilter<T> | undefined {
    const idFilter = this.filters.find(filter => filter.property === 'id' && filter.operator === QueryOperator.equal);
    if (idFilter) {
      if (this.filters.length > 1) {
        throw new Error('Searching for an ID and something else is currently not supported');
      }
    }

    return idFilter;
  }

  private filtersMatch(filters: {property: keyof T; operator: QueryOperator; value: any;}[], item: any): boolean {
    for (const filter of filters) {

      const convertedValue = this.modelClass.convertToIndexedDbValue(filter.value);

      if ((filter.operator === QueryOperator.notEqual) &&
          (
            item[filter.property] === convertedValue ||
            convertedValue === null && typeof item[filter.property] === 'undefined'
          )
      ) {
        return false;
      }

      if (filter.operator === QueryOperator.equal && (
        item[filter.property] !== convertedValue &&
          (convertedValue !== null || typeof item[filter.property] !== 'undefined')
      )) {
        return false;
      }
    }

    return true;
  }

  async list(): Promise<Array<T>> {
    const list = await this.getList();
    const ret: Array<T> = [];
    for (const item of list) {
      ret.push(await this.modelClass.createFromIndexedDbResult(item, this.relationsToLoad));
    }

    return ret;
  }

  async one(): Promise<T> {
    const list = await this.getList();
    if (list.length === 0) {
      console.log(`DB:${this.modelClass.tableName}:NOTFOUND`, this.filters);
      throw new RecordNotFoundError();
    }

    return await this.modelClass.createFromIndexedDbResult(list[0], this.relationsToLoad);
  }

  one$(): Observable<T | undefined> {
    return this.list$().pipe(map(list => {
      if (list.length === 0) {
        return undefined;
      }

      return list[0];
    }))
  }

  async delete(): Promise<number> {
    const list = await this.getList();
    if (list.length > 0) {
      await new Promise<void>(async (resolve, reject) => {
        const transaction = this.db
          .transaction([this.modelClass.tableName], 'readwrite');

        // console.log(`DB:${this.modelClass.tableName}:DELETE`, this.filters, list.map(item => item.id));
        for (const item of list) {
          transaction.objectStore(this.modelClass.tableName)
            .delete(item.id);
          item.deleted = true;
        }
        transaction.oncomplete = () => resolve();
        transaction.onerror = e => reject(e);
      });
    }

    for (const item of list) {
      this.modelClass.saved$.next({previousModel: item});
    }
    return list.length;
  }

  async count(): Promise<number> {
    const items = await this.getList();
    return items.length;
  }

  updateField(propertyName: string, value: any): Promise<number> {
    return this.update([{ propertyName, value }]);
  }

  async update(values: Array<{ propertyName: string; value: any; }>): Promise<number> {
    const items = await this.getList();

    await new Promise<void>((resolve, reject) => {
      const transaction = this.db
        .transaction([this.modelClass.tableName], 'readwrite');

      console.log(`DB:${this.modelClass.tableName}:PUT_MULTI`, this.filters, items.map(item => item.id));
      for (const item of items) {
        const store = transaction.objectStore(this.modelClass.tableName);
        for (const value of values) {
          const propertyType = this.modelClass.typeMap[value.propertyName];
          item[<keyof T> value.propertyName] = <any> this.modelClass.convertToIndexedDbValue(value.value, propertyType);
        }
        store.put(item, item.id);
      }

      transaction.oncomplete = () => resolve();
      transaction.onerror = e => reject(e);
    });

    return items.length;
  }

  include(relationsToLoad: QueryRelations<keyof T>): QueryCollection<T> {
    this.relationsToLoad = relationsToLoad;
    return this;
  }
}
