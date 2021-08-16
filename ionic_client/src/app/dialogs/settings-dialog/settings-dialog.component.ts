import { ChangeDetectionStrategy, Component, EventEmitter, Injector, OnDestroy  } from '@angular/core';
import { ModalController } from '@ionic/angular';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { AvailableSettings } from 'src/app/models/interfaces/available-settings';
import {  SettingConfigurationWithValue, SettingConfigurationWithValueInjector, settingInjectionToken } from 'src/app/models/interfaces/setting-configuration';
import { Setting } from 'src/app/models/orm/setting';
import { SettingsService } from 'src/app/services/settings.service';

@Component({
  selector: 'app-settings-dialog',
  templateUrl: './settings-dialog.component.html',
  styleUrls: ['./settings-dialog.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class SettingsDialogComponent implements OnDestroy  {
  public readonly destroy$ = new Subject<void>();

  public settings = <SettingConfigurationWithValueInjector[]> Object.keys(this.settingsService.settingsConfiguration)
    .filter((key: keyof AvailableSettings) => this.settingsService.settingsConfiguration[key].inlineComponent)
    .map((key: keyof AvailableSettings) => {
      const config =  this.settingsService.settingsConfiguration[key];

      const valueChange = new EventEmitter<string | boolean>();
      valueChange
        .pipe(takeUntil(this.destroy$))
        .subscribe(value => Setting.set(key, value));

      const configWithValue: SettingConfigurationWithValue = {
        ...config,
        value: Setting.cached(key),
        valueChange,
      };

      return {
        ...config,
        valueInjector: Injector.create({
          providers: [
            {
              provide: settingInjectionToken,
              useValue: configWithValue,
            },
          ],
          parent: this.injector,
        }),
      };
    });

  public constructor(public readonly modalCtrl: ModalController, private readonly injector: Injector, private readonly settingsService: SettingsService) {
  }

  public ngOnDestroy(): void {
    this.destroy$.next();
  }
}


