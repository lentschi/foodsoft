import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { GroupOrderArticle } from 'src/app/models/orm/group-order-article';
import { SettingsService } from '../settings.service';
import { BaseApiService } from './base-api.service';

@Injectable()
export class GroupOrderArticlesApiService extends BaseApiService<GroupOrderArticle> {
  protected readonly modelName = 'group_order_articles';

  public constructor(httpClient: HttpClient, settingsService: SettingsService) {
    super(GroupOrderArticle, httpClient, settingsService);
  }
}
