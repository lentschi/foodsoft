import { Injectable } from '@angular/core';
import { TranslateService } from '@ngx-translate/core';
import { SettingBooleanComponent } from '../dialogs/settings-dialog/inline-components/boolean/setting-boolean.component';
import { AvailableSettings } from '../models/interfaces/available-settings';
import { SettingConfiguration } from '../models/interfaces/setting-configuration';

@Injectable()
export class SettingsService {
  public readonly settingsConfiguration: { [settingKey in keyof AvailableSettings]: SettingConfiguration<AvailableSettings[settingKey]> } = {
    oAuthToken: {},
    userName: {},
    password: {},
    offlineMode: {
      default: false,
      label$: this.translationService.stream('offline mode'),
      inlineComponent: SettingBooleanComponent,
    },
  };

  public constructor(private readonly translationService: TranslateService) {}
}
