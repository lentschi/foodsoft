import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Order } from 'src/app/models/orm/order';
import { Task } from 'src/app/models/orm/task';
import { SettingsService } from '../settings.service';
import { BaseApiService } from './base-api.service';
import { OrdersApiService } from './orders-api.service';

@Injectable()
export class StockServicesApiService extends BaseApiService<Task> {
  protected readonly modelName = 'orders/:order_id/stock_services';

  public constructor(httpClient: HttpClient, settingsService: SettingsService, private readonly ordersApiService: OrdersApiService) {
    super(Task, httpClient, settingsService);
  }

  public async signUp(order: Order, asResponsibleUser = true): Promise<void> {
    const response = await this.httpClient.put(this.modelUrl.replace(':order_id', String(order.serverId)), { as_responsible_user: asResponsibleUser }).toPromise();
    const data = this.extractModelDataFromServerResponse(response);
    const task = Task.unmarshalServerData(data);
    await task.save();
    await this.saveRelationsReturnedFromServer(task);

    // eslint-disable-next-line require-atomic-updates
    order.taskId = task.id;
    await order.save();
  }

  public async unsubscribe(orderId: number): Promise<void> {
    await this.httpClient.delete(this.modelUrl.replace(':order_id', String(orderId))).toPromise();
    await this.ordersApiService.get(orderId);
  }
}
