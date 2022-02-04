import { EventEmitter, InjectionToken, Injector, Type } from '@angular/core';
import { Observable } from 'rxjs';

export const settingInjectionToken = new InjectionToken<SettingConfigurationWithValue>('setting');

export interface SettingConfiguration<T = unknown> {
  default?: T;
  label$?: Observable<string>;
  inlineComponent?: Type<unknown>;
}

export interface SettingConfigurationWithValueInjector extends SettingConfiguration {
  valueInjector: Injector;
  inlineComponent: Type<unknown>;
}

export interface SettingConfigurationWithValue<ValueType = unknown> extends SettingConfiguration {
  value: ValueType;
  valueChange: EventEmitter<ValueType>;
}
