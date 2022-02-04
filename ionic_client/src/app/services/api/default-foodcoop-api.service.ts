import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { SettingsService } from '../settings.service';

@Injectable()
export class DefaultFoodcoopApiService {
  public constructor(protected readonly httpClient: HttpClient, protected readonly settingsService: SettingsService) {}

  public async getDefaultFoodcoop(): Promise<string> {
    return <string> await this.httpClient.get(this.getBaseUrl()).toPromise();
  }

  private getBaseUrl(): string {
    return `${this.settingsService.getBaseUrlWithoutFoodcoop()}/api/v1/default_foodcoop`;
  }
}
