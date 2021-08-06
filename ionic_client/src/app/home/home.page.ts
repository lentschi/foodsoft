import { HttpClient } from '@angular/common/http';
import { Component } from '@angular/core';
import { User } from '../models/user';
import { DbManager } from '../services/db-manager';

@Component({
  selector: 'app-home',
  templateUrl: 'home.page.html',
  styleUrls: ['home.page.scss'],
})
export class HomePage {
  public constructor(private httpClient: HttpClient, private readonly dbManager: DbManager) {}

  public async test(): Promise<void> {
    // const response = await this.httpClient.get('http://localhost:3000/ruebezahl17/api/v1/config').toPromise();

    await this.dbManager.initialize();

    // const user = new User();
    // user.name = 'Flo';
    // await user.save();
    const collection = User.all();
    const single = await collection.list();
    console.log('resp', single);
  }
}
