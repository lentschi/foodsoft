import { IndexedMigration } from '../indexed-migration';

export class InitialMigration extends IndexedMigration {
  public migrate(openDbRequest: IDBOpenDBRequest): IDBTransaction {
    const db = openDbRequest.result;

    let store = db.createObjectStore('Setting');
    store.createIndex('key', 'key');

    store = db.createObjectStore('Order');
    store.createIndex('key', 'key');
    store.createIndex('supplierId', 'supplierId');
    store.createIndex('groupOrderId', 'groupOrderId');

    store = db.createObjectStore('OrderArticle');
    store.createIndex('key', 'key');
    store.createIndex('orderId', 'orderId');
    store.createIndex('articleId', 'articleId');

    store = db.createObjectStore('Article');
    store.createIndex('key', 'key');
    store.createIndex('supplierId', 'supplierId');

    store = db.createObjectStore('Supplier');
    store.createIndex('key', 'key');

    store = db.createObjectStore('GroupOrder');
    store.createIndex('key', 'key');

    store = db.createObjectStore('GroupOrderArticle');
    store.createIndex('key', 'key');
    store.createIndex('groupOrderId', 'groupOrderId');
    store.createIndex('orderArticleId', 'orderArticleId');

    return store.transaction;
  }
}
