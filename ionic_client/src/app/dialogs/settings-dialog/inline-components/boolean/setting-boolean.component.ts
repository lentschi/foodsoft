import { ChangeDetectionStrategy, Component, Inject, OnDestroy } from '@angular/core';
import { FormControl } from '@angular/forms';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { SettingConfigurationWithValue, settingInjectionToken } from 'src/app/models/interfaces/setting-configuration';

@Component({
  selector: 'app-setting-boolean',
  templateUrl: './setting-boolean.component.html',
  styleUrls: ['./setting-boolean.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class SettingBooleanComponent implements OnDestroy {
  public settingControl = new FormControl();

  private readonly destroy$ = new Subject<void>();

  public constructor(@Inject(settingInjectionToken) public readonly setting: SettingConfigurationWithValue<boolean>) {
    this.settingControl.setValue(setting.value);
    this.settingControl.valueChanges
      .pipe(takeUntil(this.destroy$))
      .subscribe(value => setting.valueChange.emit(value));
  }

  public ngOnDestroy():void {
    this.destroy$.next();
  }
}
