import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { OrderState } from 'src/app/models/enums/order-state';
import { Order } from 'src/app/models/orm/order';
import { OrderArticle } from 'src/app/models/orm/order-article';
import { QueryOperator } from 'src/app/utils/orm/operator-enum';
import { SettingsService } from '../settings.service';
import { BaseApiService } from './base-api.service';

@Injectable()
export class OrdersApiService extends BaseApiService<Order> {
  protected readonly modelName = 'orders';

  public constructor(httpClient: HttpClient, settingsService: SettingsService) {
    super(Order, httpClient, settingsService);
  }

  public async getTodaysPage(): Promise<number> {
    let params = new HttpParams();
    params = params.set('per_page', '20');
    params = params.set('order', 'ends');
    params = params.set('order_direction', 'asc');
    const response = <number> await this.httpClient.get(`${this.baseUrl}/orders_today_page`, { params }).toPromise();
    return response;
  }

  public async getOrderArticles(orderId: number): Promise<OrderArticle[]> {
    let params = new HttpParams();
    params = params.set('per_page', '-1');
    const response = <{order_articles: Partial<OrderArticle>[];}> await this.httpClient.get(`${this.modelUrl}/${orderId}/order_articles`, { params }).toPromise();

    const orderArticles = response.order_articles.map(articleResponse => OrderArticle.unmarshalServerData(articleResponse));

    // Overwrite in DB:
    await OrderArticle.all().filter('orderId', QueryOperator.equal, Order.serverToIndexDbId(orderId))
      .delete();

    for (const orderArticle of orderArticles) {
      await orderArticle.article.save();
      await orderArticle.save();
    }
    return orderArticles;
  }

  public async finish(order: Order): Promise<void> {
    await this.httpClient.post(`${this.modelUrl}/${order.serverId}/finish`, {}).toPromise();
    // eslint-disable-next-line require-atomic-updates
    order.state = OrderState.finished;
    await order.save();
  }

  public async receive(order: Order, orderArticles: OrderArticle[], restToTolerance: boolean): Promise<void> {
    const order_articles: {[orderArticleId: number]: {units_received?: number;};} = {};
    for (const orderArticle of orderArticles) {
      order_articles[orderArticle.serverId] = {
        units_received: orderArticle.unitsReceived,
      };
    }

    await this.httpClient.post(`${this.modelUrl}/${order.serverId}/receive`, {
      rest_to_tolerance: restToTolerance,
      order_articles,
    }).toPromise();
    // eslint-disable-next-line require-atomic-updates
    order.state = OrderState.received;
    await order.save();
    for (const orderArticle of order.orderArticles) {
      await orderArticle.save();
    }
  }
}
