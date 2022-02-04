import { IndexedMigration } from '../indexed-migration';
import { Injectable } from '@angular/core';

@Injectable()
export class InitialMigration extends IndexedMigration {
  public migrate(openDbRequest: IDBOpenDBRequest): IDBTransaction {
    const db = openDbRequest.result;

    let store = db.createObjectStore('Setting');
    store.createIndex('key', 'key');

    store = db.createObjectStore('Order');
    store.createIndex('key', 'key');
    store.createIndex('supplierId', 'supplierId');
    store.createIndex('groupOrderId', 'groupOrderId');
    store.createIndex('ends', 'ends');

    store = db.createObjectStore('OrderArticle');
    store.createIndex('key', 'key');
    store.createIndex('orderId', 'orderId');
    store.createIndex('articleId', 'articleId');

    store = db.createObjectStore('Article');
    store.createIndex('key', 'key');
    store.createIndex('supplierId', 'supplierId');

    store = db.createObjectStore('Supplier');
    store.createIndex('orderRepetitionSettingId', 'orderRepetitionSettingId');
    store.createIndex('key', 'key');

    store = db.createObjectStore('GroupOrder');
    store.createIndex('key', 'key');

    store = db.createObjectStore('GroupOrderArticle');
    store.createIndex('key', 'key');
    store.createIndex('groupOrderId', 'groupOrderId');
    store.createIndex('orderArticleId', 'orderArticleId');

    store = db.createObjectStore('User');
    store.createIndex('key', 'key');

    store = db.createObjectStore('Task');
    store.createIndex('key', 'key');
    store.createIndex('responsibleUserId', 'responsibleUserId');

    store = db.createObjectStore('TaskUser_habtm');
    store.createIndex('key', 'key');
    store.createIndex('userId', 'userId');
    store.createIndex('taskId', 'taskId');

    store = db.createObjectStore('OrderRepetitionSetting');
    store.createIndex('key', 'key');

    return store.transaction;
  }
}
