import { Injectable } from '@angular/core';
import * as ClientOAuth2 from 'client-oauth2';
import { oAuthClientId, oAuthClientSecret } from 'src/config/client-id';
import { Setting } from '../models/orm/setting';
import { SettingsService } from './settings.service';

@Injectable()
export class LoginService {
  public constructor(private readonly settingsService: SettingsService) {}

  public autoLogin(): Promise<string> {
    const userName = Setting.cached('userName', true);
    const password = Setting.cached('password', true);
    if (userName === undefined || password === undefined) {
      throw new Error('Never logged in before');
    }

    return this.login(userName, password, false);
  }

  public async login(userName: string, password: string, storeCredentials = true): Promise<string> {
    const auth = new ClientOAuth2({
      clientId: oAuthClientId,
      clientSecret: oAuthClientSecret,
      accessTokenUri: `${this.settingsService.getBaseUrl()}/oauth/token`,
      authorizationUri: `${this.settingsService.getBaseUrl()}/oauth/authorize`,
      redirectUri: '',
    });

    let accessToken: string;
    try {
      const token = await auth.owner.getToken(userName, password);
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
