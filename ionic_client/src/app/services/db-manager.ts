import { Injectable, Inject } from '@angular/core';
import { IndexedMigration } from 'src/config/indexed-migrations/indexed-migration';
import { Setting } from '../models/setting';
import { AppModel } from '../utils/orm';


const DATABASE_NAME = 'FoodsoftClient';

@Injectable()
export class DbManager {
  public constructor(@Inject(IndexedMigration) private indexedMigrations: IndexedMigration[]) { }

  public async initialize(): Promise<void> {
    await this.migrateIndexedDb();
    await Setting.addDefaultsForMissingKeys();
  }

  private get targetSchemaVersion(): number {
    return this.indexedMigrations.length;
  }


  /**
   * Run indexedDb migrations
   * @returns version that we migrated from or null if no migration was required
   */
  private async migrateIndexedDb(fromVersion?: number, toVersion = this.targetSchemaVersion): Promise<number | undefined> {
    let upgradeNeeded = false;
    let db: IDBDatabase;

    const upgradedFrom = await new Promise<number | undefined>((resolve, reject) => {
      const request = indexedDB.open(DATABASE_NAME, toVersion);
      request.onerror = (error): void => reject(error);
      request.onupgradeneeded = (event: IDBVersionChangeEvent): void => {
        const startVersion = typeof fromVersion === 'undefined' ? event.oldVersion : fromVersion;
        upgradeNeeded = true;
        db = request.result;
        let transaction: IDBTransaction;
        console.log(`DB: Migration from version ${startVersion} to ${toVersion} required`);
        for (const migration of this.indexedMigrations.slice(startVersion, toVersion)) {
          transaction = migration.migrate(<IDBOpenDBRequest> event.target);
        }

        transaction!.oncomplete = (): void => resolve(startVersion);
        transaction!.onerror = (e): void => reject(e);
      };


      request.onsuccess = (): void => {
        if (!upgradeNeeded) {
          console.log('DB: No migration needed');
          db = request.result;
          resolve(undefined);
        }
      };
    });

    console.log('DB: Done migrating', upgradedFrom);
    AppModel.db = db!;

    return upgradedFrom;
  }
}
