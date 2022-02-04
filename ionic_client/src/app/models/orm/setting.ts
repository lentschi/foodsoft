import { Observable, Subject } from 'rxjs';
import { filter, map, startWith } from 'rxjs/operators';
import { AppModel, Column, PersistenceModel } from '../../utils/orm';
import { AvailableSettings } from '../interfaces/available-settings';
import { SettingConfiguration } from '../interfaces/setting-configuration';

@PersistenceModel('Setting')
export class Setting extends AppModel {
  private static readonly settingsCache: { [settingKey: string]: unknown; } = {};

  private static readonly changeSubject$ = new Subject<{key: string; value: unknown;}>();

  @Column()
  public key: string;

  @Column()
  public value: string;

  /**
   * Insert default values for all missing setting keys
   * @param  {Function} callback Optional callback function
   */
  public static async addDefaultsForMissingKeys(settingsConfiguration: { [settingKey in keyof AvailableSettings]: SettingConfiguration<AvailableSettings[settingKey]> }): Promise<void> {
    const settings =  await Setting.all().list();

    for (const settingKey of <Array<keyof AvailableSettings>> Object.keys(settingsConfiguration)) {
      const settingConfig = settingsConfiguration[settingKey];

      let setting = settings.find(curSetting => curSetting.key === settingKey);
      if (setting) {
        Setting.settingsCache[settingKey] = JSON.parse(setting.value);
      } else if ('default' in settingConfig) {
        // setting with that key doesn't exist
        // -> created it with the default value:
        setting = new Setting();
        setting.key = settingKey;
        Setting.settingsCache[settingKey] = settingConfig.default;
        await setting.saveValue(JSON.stringify(settingConfig.default));
      }

      this.changeSubject$.next({ key: settingKey, value: Setting.settingsCache[settingKey] });
    }
  }

  /**
   * Set a setting to a specific value
   * @param key - The setting's key
   * @param value - The value to set
   */
  public static async set<PropertyKey extends keyof AvailableSettings>(key: PropertyKey, value: AvailableSettings[PropertyKey]): Promise<Setting> {
    Setting.settingsCache[key] = value;
    let setting: Setting;
    try {
      setting =  await Setting.findBy('key', key);
      if (setting.value === value) {
        return setting;
      }
    } catch (e) {
      setting = new Setting();
      setting.key = key;
    }

    await setting.saveValue(JSON.stringify(value));
    this.changeSubject$.next({ key, value });
    return setting;
  }

  public static cached<PropertyKey extends keyof AvailableSettings>(key: PropertyKey, allowMissing = false): AvailableSettings[PropertyKey] | undefined {
    if (!(key in Setting.settingsCache)) {
      if (allowMissing) {
        return undefined;
      } else {
        throw new Error(`Setting ${key} has not been cached`);
      }
    }

    return <AvailableSettings[PropertyKey]> Setting.settingsCache[key];
  }

  public static cached$<PropertyKey extends keyof AvailableSettings>(key: PropertyKey): Observable<AvailableSettings[PropertyKey] | undefined> {
    return this.changeSubject$.pipe(
      filter(cache => cache.key === key),
      map(cache => <AvailableSettings[PropertyKey] | undefined> cache.value),
      startWith(<AvailableSettings[PropertyKey] | undefined> Setting.settingsCache[key])
    );
  }

  public static async remove<PropertyKey extends keyof AvailableSettings>(key: PropertyKey): Promise<void> {
    Setting.settingsCache[key] = undefined;
    const setting = await Setting.findBy('key', key);
    if (setting) {
      await setting.delete();
    }
    this.changeSubject$.next({ key, value: undefined });
  }

  public saveValue(value: string): Promise<void> {
    this.value = value;
    return this.save();
  }
}
