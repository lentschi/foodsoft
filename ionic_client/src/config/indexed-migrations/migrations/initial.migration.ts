import { IndexedMigration } from '../indexed-migration';

export class InitialMigration extends IndexedMigration {
  public migrate(openDbRequest: IDBOpenDBRequest): IDBTransaction {
    const db = openDbRequest.result;

    let store = db.createObjectStore('Setting');
    store.createIndex('key', 'key');

    store = db.createObjectStore('Order');
    store.createIndex('key', 'key');
    store.createIndex('serverId', 'serverId');

    return store.transaction;
  }
}
