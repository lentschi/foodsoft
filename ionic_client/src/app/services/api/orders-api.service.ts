import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Order } from 'src/app/models/orm/order';
import { OrderArticle } from 'src/app/models/orm/order-article';
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
    for (const orderArticle of orderArticles) {
      await orderArticle.article.save();
      await orderArticle.save();
    }
    return orderArticles;
  }
}
