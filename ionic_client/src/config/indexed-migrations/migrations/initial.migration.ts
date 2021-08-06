import { IndexedMigration } from '../indexed-migration';

export class InitialMigration extends IndexedMigration {
  public migrate(openDbRequest: IDBOpenDBRequest): IDBTransaction {
    const db = openDbRequest.result;

    const store = db.createObjectStore('Setting');
    store.createIndex('key', 'key');

    return store.transaction;
  }
}
