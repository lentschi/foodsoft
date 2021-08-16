import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Order } from 'src/app/models/orm/order';
import { BaseApiService } from './base-api.service';

@Injectable()
export class OrdersApiService extends BaseApiService<Order> {
  protected readonly modelName = 'orders';

  public constructor(httpClient: HttpClient) {
    super(Order, httpClient);
  }

  public async getTodaysPage(): Promise<number> {
    let params = new HttpParams();
    params = params.set('per_page', '20');
    params = params.set('order', 'ends');
    params = params.set('order_direction', 'asc');
    const response = <number> await this.httpClient.get(`${this.baseUrl}/orders_today_page`, { params }).toPromise();
    return response;
  }
}
