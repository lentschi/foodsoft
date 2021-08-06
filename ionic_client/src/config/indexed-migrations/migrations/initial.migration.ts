import { IndexedMigration } from '../indexed-migration';

export class InitialMigration extends IndexedMigration {
  public migrate(openDbRequest: IDBOpenDBRequest): IDBTransaction {
    const db = openDbRequest.result;

    const store = db.createObjectStore('User');
    store.createIndex('name', 'name');

    return store.transaction;
  }
}
