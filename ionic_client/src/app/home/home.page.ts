import { HttpClient } from '@angular/common/http';
import { Component } from '@angular/core';
import * as ClientOAuth2 from 'client-oauth2';

@Component({
  selector: 'app-home',
  templateUrl: 'home.page.html',
  styleUrls: ['home.page.scss'],
})
export class HomePage {
  constructor(private httpClient: HttpClient) {}

  async test() {
    const response = await this.httpClient.get(`http://localhost:3000/ruebezahl17/api/v1/config`).toPromise();

    console.log('resp', response);
  }
}
