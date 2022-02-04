import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Order } from 'src/app/models/orm/order';
import { SettingsService } from '../settings.service';
import { BaseApiService } from './base-api.service';

@Injectable()
export class BalancingApiService extends BaseApiService<Order> {
  protected modelName = 'balancing';

  public constructor(httpClient: HttpClient, settingsService: SettingsService) {
    super(Order, httpClient, settingsService);
  }

  public async close(order: Order): Promise<Order> {
    const response = await this.httpClient.post(`${this.modelUrl}/${order.serverId}/close`, {}).toPromise();
    const returnData = this.extractModelDataFromServerResponse(response);
    const closedOrder = this.modelType.unmarshalServerData(returnData);

    await closedOrder.save();
    return closedOrder;
  }

  protected get baseUrl(): string {
    return `${super.baseUrl}/finance`;
  }
}
