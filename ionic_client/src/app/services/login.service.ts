import { Injectable } from '@angular/core';
import * as ClientOAuth2 from 'client-oauth2';
import { Setting } from '../models/orm/setting';

@Injectable()
export class LoginService {
  private readonly baseUrl = window.location.href.split('/').slice(0, 3)
    .join('/')
    .replace('4200', '3000');

  private readonly auth = new ClientOAuth2({
    clientId: 'RhGguyvsjQOADrGiAix9Ds6uh2vjsHfUJFzWExuEw_Y',
    clientSecret: 'eMIeiaeMNnwHnFIfsg0SA_sgeIpBzG6vqI7-qpZydg8',
    accessTokenUri: `${this.baseUrl}/ruebezahl17/oauth/token`,
    authorizationUri: `${this.baseUrl}/ruebezahl17/oauth/authorize`,
    redirectUri: `${window.location.href.split('/').slice(0, 3)
      .join('/')}/home`,
  });

  public async autoLogin(): Promise<string> {
    const userName = Setting.cached('userName', true);
    const password = Setting.cached('password', true);
    if (userName === undefined || password === undefined) {
      throw new Error('Never logged in before');
    }

    return this.login(userName, password, false);
  }

  public async login(userName: string, password: string, storeCredentials = true): Promise<string> {
    let accessToken: string;
    try {
      const token = await this.auth.owner.getToken(userName, password);
      ({ accessToken } = token);
    } catch (e) {
      if (e.body?.error === 'invalid_grant') {
        throw new PermissionDenied();
      }
      throw e;
    }

    if (storeCredentials) {
      await Setting.set('userName', `${userName}`);
      await Setting.set('password', password);
    }

    return accessToken;
  }
}

export class PermissionDenied extends Error {
}
