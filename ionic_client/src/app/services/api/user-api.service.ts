import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { User } from 'src/app/models/orm/user';
import { SettingsService } from '../settings.service';
import { BaseApiService } from './base-api.service';

@Injectable()
export class UserApiService extends BaseApiService<User> {
  protected readonly modelName = 'user';

  public constructor(httpClient: HttpClient, settingsService: SettingsService) {
    super(User, httpClient, settingsService);
  }

  public async getCurrentUser(): Promise<User> {
    const response = await this.httpClient.get(this.modelUrl).toPromise();
    // eslint-disable-next-line @typescript-eslint/no-explicit-any, no-extra-parens
    const data = <Partial<User>> (<any> response)['user'];
    const model = this.modelType.unmarshalServerData(data);
    await model.save();
    await this.saveRelationsReturnedFromServer(model);
    return model;
  }
}
