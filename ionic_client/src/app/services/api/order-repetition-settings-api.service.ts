import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { OrderRepetitionSetting } from 'src/app/models/orm/order-repetition-setting';
import { Supplier } from 'src/app/models/orm/supplier';
import { SettingsService } from '../settings.service';
import { BaseApiService } from './base-api.service';

@Injectable()
export class OrderRepetitionSettingsApiService extends BaseApiService<OrderRepetitionSetting> {
  protected readonly modelName = 'suppliers/:supplier_id/order_repetition_settings';

  public constructor(httpClient: HttpClient, settingsService: SettingsService) {
    super(OrderRepetitionSetting, httpClient, settingsService);
  }

  public async configure(supplier: Supplier, setting: OrderRepetitionSetting): Promise<OrderRepetitionSetting> {
    const response = await this.httpClient.put(this.modelUrl.replace(':supplier_id', String(supplier.serverId)), { frequency: setting.frequency, pickup_offset: setting.pickupOffset, starts_at: setting.startsAt }).toPromise();
    const modelData = this.extractModelDataFromServerResponse(response);
    const returnedSetting = OrderRepetitionSetting.unmarshalServerData(modelData);
    await returnedSetting.save();

    // eslint-disable-next-line require-atomic-updates
    supplier.orderRepetitionSettingId = returnedSetting.id;
    await supplier.save();

    return returnedSetting;
  }

  public async disable(supplier: Supplier): Promise<void> {
    await this.httpClient.delete(this.modelUrl.replace(':supplier_id', String(supplier.serverId))).toPromise();
    const setting = supplier.orderRepetitionSetting!;

    supplier.orderRepetitionSettingId = undefined;
    supplier.orderRepetitionSetting = undefined;
    await supplier.save();

    await setting.delete();
  }
}
