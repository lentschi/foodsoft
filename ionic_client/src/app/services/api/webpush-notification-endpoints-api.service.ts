import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { SettingsService } from '../settings.service';

@Injectable()
export class WebPushNotificationEndpointsApiService  {
  public constructor(protected readonly httpClient: HttpClient, protected readonly settingsService: SettingsService) {}

  public async update(subscription: PushSubscription): Promise<number> {
    const subscriptionData = subscription.toJSON();
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const response: any = await this.httpClient.put(this.getBaseUrl(), { url: subscriptionData.endpoint, auth_key: subscriptionData.keys!.auth, p256dh_key: subscriptionData.keys!.p256dh }).toPromise();
    return response.webpush_notification_endpoint.id;
  }

  public async delete(id: number): Promise<void> {
    await this.httpClient.delete(`${this.getBaseUrl()}/${id}`).toPromise();
  }

  private getBaseUrl(): string {
    return `${this.settingsService.getBaseUrl()}/api/v1/webpush_notification_endpoints`;
  }
}
