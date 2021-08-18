import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { GroupOrder } from 'src/app/models/orm/group-order';
import { GroupOrderArticle } from 'src/app/models/orm/group-order-article';
import { SettingsService } from '../settings.service';
import { BaseApiService } from './base-api.service';

@Injectable()
export class GroupOrdersApiService extends BaseApiService<GroupOrder> {
  protected readonly modelName = 'group_orders';

  public constructor(httpClient: HttpClient, settingsService: SettingsService) {
    super(GroupOrder, httpClient, settingsService);
  }

  public async saveAmounts(groupOrder: GroupOrder, goas: GroupOrderArticle[]): Promise<void> {
    const body = {
      group_order_articles: goas.map(goa => ({
        order_article_id: parseInt(goa.orderArticleId, 10),
        quantity: goa.quantity,
        tolerance: goa.tolerance,
      })),
    };
    await this.httpClient.patch(`${this.modelUrl}/${groupOrder.serverId}`, body).toPromise();
  }
}
