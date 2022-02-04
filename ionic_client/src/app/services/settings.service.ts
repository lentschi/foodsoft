import { Injectable } from '@angular/core';
import { ActivationStart, Router } from '@angular/router';
import { TranslateService } from '@ngx-translate/core';
import { BehaviorSubject } from 'rxjs';
import { filter } from 'rxjs/operators';
import { SettingBooleanComponent } from '../dialogs/settings-dialog/inline-components/boolean/setting-boolean.component';
import { AvailableSettings } from '../models/interfaces/available-settings';
import { SettingConfiguration } from '../models/interfaces/setting-configuration';

@Injectable()
export class SettingsService {
  public foodcoop$ = new BehaviorSubject<string | undefined>(undefined);

  public readonly settingsConfiguration: { [settingKey in keyof AvailableSettings]: SettingConfiguration<AvailableSettings[settingKey]> } = {
    oAuthToken: {},
    wepPushNotificationEndpointId: {},
    userName: {},
    password: {},
    userId: {},
    offlineMode: {
      default: false,
      label$: this.translationService.stream('offline mode'),
      inlineComponent: SettingBooleanComponent,
    },
  };

  private baseUrl$ = new BehaviorSubject<string | undefined>(undefined);

  public constructor(private readonly translationService: TranslateService, router: Router) {
    router.events.pipe(filter(isActivationStart)).subscribe(event => {
      this.foodcoop$.next(event.snapshot.paramMap.get('foodcoop') ?? undefined);

      // TODO-no-upstream:
      this.baseUrl$.next(`${this.getBaseUrlWithoutFoodcoop()}/${this.foodcoop$.value}`);
    });
  }

  public getBaseUrlWithoutFoodcoop(): string {
    // TODO-no-upstream:
    return `${window.location.href.split('/').slice(0, 3)
      .join('/')
    }/server`;
  }

  public getBaseUrl(): string {
    if (this.baseUrl$.value === undefined) {
      throw new Error('not available');
    }

    return this.baseUrl$.value;
  }
}

const isActivationStart = (event: unknown): event is ActivationStart => event instanceof ActivationStart;
