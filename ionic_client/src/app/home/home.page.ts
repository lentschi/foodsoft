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

  async login() {
    const auth = new ClientOAuth2({
      clientId: 'RhGguyvsjQOADrGiAix9Ds6uh2vjsHfUJFzWExuEw_Y',
      clientSecret: 'eMIeiaeMNnwHnFIfsg0SA_sgeIpBzG6vqI7-qpZydg8',
      accessTokenUri: 'http://localhost:3000/ruebezahl17/oauth/token',
      authorizationUri: 'http://localhost:3000/ruebezahl17/oauth/authorize',
      redirectUri: 'http://localhost:8100/home'
    });

    let token = await auth.owner.getToken('Florian Lentsch', 'hasi!#//i');
    localStorage.setItem('oAuthToken', token.accessToken);

    // const request = token.sign<any>({
    //   method: 'get',
    //   url: 'http://localhost:3000/ruebezahl17/admin/users'
    // });

    const response = await this.httpClient.get(`http://localhost:3000/ruebezahl17/api/v1/config`).toPromise();

    console.log('resp', response);
  }
}
