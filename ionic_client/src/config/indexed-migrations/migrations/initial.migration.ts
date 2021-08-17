import { IndexedMigration } from '../indexed-migration';

export class InitialMigration extends IndexedMigration {
  public migrate(openDbRequest: IDBOpenDBRequest): IDBTransaction {
    const db = openDbRequest.result;

    let store = db.createObjectStore('Setting');
    store.createIndex('key', 'key');

    store = db.createObjectStore('Order');
    store.createIndex('key', 'key');

    store = db.createObjectStore('OrderArticle');
    store.createIndex('key', 'key');
    store.createIndex('orderId', 'orderId');
    store.createIndex('articleId', 'articleId');

    store = db.createObjectStore('Article');
    store.createIndex('key', 'key');

    return store.transaction;
  }
}
