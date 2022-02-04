import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { GroupOrder } from 'src/app/models/orm/group-order';
import { GroupOrderArticle } from 'src/app/models/orm/group-order-article';
import { Order } from 'src/app/models/orm/order';
import { SettingsService } from '../settings.service';
import { BaseApiService } from './base-api.service';

@Injectable()
export class GroupOrdersApiService extends BaseApiService<GroupOrder> {
  protected readonly modelName = 'group_orders';

  public constructor(httpClient: HttpClient, settingsService: SettingsService) {
    super(GroupOrder, httpClient, settingsService);
  }

  public async saveAmounts(groupOrder: GroupOrder, goas: GroupOrderArticle[]): Promise<void> {
    const body: {
      order_id?: number;
      group_order_articles: {
        order_article_id: number;
        quantity: number;
        tolerance: number;
      }[];
    } = {
      group_order_articles: goas.map(goa => ({
        order_article_id: parseInt(goa.orderArticleId, 10),
        quantity: goa.quantity,
        tolerance: goa.tolerance,
      })),
    };

    let groupOrderId: number;
    try {
      groupOrderId = groupOrder.serverId;
    } catch (e) {
      body.order_id = Order.indexedDbToServerId(groupOrder.orderId);
      await this.httpClient.post(`${this.modelUrl}`, body).toPromise();
      return;
    }
    await this.httpClient.patch(`${this.modelUrl}/${groupOrderId}`, body).toPromise();
  }
}
