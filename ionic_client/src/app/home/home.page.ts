import { HttpClient } from '@angular/common/http';
import { Component } from '@angular/core';
import { DbManager } from '../services/db-manager';

@Component({
  selector: 'app-home',
  templateUrl: 'home.page.html',
  styleUrls: ['home.page.scss'],
})
export class HomePage {
  public constructor(private httpClient: HttpClient, private readonly dbManager: DbManager) {}

  public async test(): Promise<void> {
    await this.dbManager.initialize();
    const response = await this.httpClient.get('http://localhost:3000/ruebezahl17/api/v1/config').toPromise();

    // const user = new User();
    // user.name = 'Flo';
    // await user.save();
    // const collection = User.all();
    // const single = await collection.list();
    // const single = await User.all().filter('id', QueryOperator.equal, 'e014e950-f69c-11eb-9768-39e4ab00da53')
    //   .one();
    console.log('resp', response);
  }
}
