// store = db.createObjectStore('ObsTest');
// store.createIndex('key', 'key');
// store.createIndex('mynum', 'mynum');


// @PersistenceModel('ObsTest')
// export class ObsTest extends AppModel {
//   @Column() public mynum: number;
// }


// await new Promise<void>(resolve => setTimeout(() => resolve(), 1000));

// const existing = await ObsTest.all().list();

// // await new Promise<void>(resolve => setTimeout(() => resolve(), 1000));

// for (const obs of existing) {
//   console.log('Deleting', obs.mynum, obs.id);
//   await obs.delete();
// }

// console.log('Listing');
// ObsTest.all().list$()
//   .pipe(takeUntil(this.destroy$))
//   .subscribe(list => {
//     console.log('list', list.map(l => l.mynum));
//     this.tmp = list;
//   });
// console.log('Done listing');

// // await new Promise<void>(resolve => setTimeout(() => resolve(), 100));

// const obsTest1 = new ObsTest();
// obsTest1.mynum = 10;

// await obsTest1.save();
// console.log('Saved 1', obsTest1);

// // await new Promise<void>(resolve => setTimeout(() => resolve(), 100));

// const obsTest2 = new ObsTest();
// obsTest2.mynum = 20;
// await obsTest2.save();
// console.log('Saved 2', obsTest2);

// // await new Promise<void>(resolve => setTimeout(() => resolve(), 100));

// await obsTest1.delete();
// console.log('Deleted 1');

// const obsTest3 = new ObsTest();
// obsTest3.mynum = 30;
// await obsTest3.save();
// console.log('Saved 3', obsTest3);

// await obsTest3.delete();
// console.log('Deleted 3');
