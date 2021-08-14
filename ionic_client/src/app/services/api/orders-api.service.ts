import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Order } from 'src/app/models/order';
import { BaseApiService } from './base-api.service';

@Injectable()
export class OrdersApiService extends BaseApiService<Order> {
  protected readonly modelName = 'orders';

  public constructor(httpClient: HttpClient) {
    super(Order, httpClient);
  }
}
