import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { GroupOrder } from 'src/app/models/orm/group-order';
import { SettingsService } from '../settings.service';
import { BaseApiService } from './base-api.service';

@Injectable()
export class GroupOrdersApiService extends BaseApiService<GroupOrder> {
  protected readonly modelName = 'group_orders';

  public constructor(httpClient: HttpClient, settingsService: SettingsService) {
    super(GroupOrder, httpClient, settingsService);
  }
}
