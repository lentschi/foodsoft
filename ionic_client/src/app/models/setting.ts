import { AppModel, Column, PersistenceModel } from '../utils/orm';

@PersistenceModel('Setting')
export class Setting extends AppModel {
  private static readonly settingsCache: { [settingKey: string]: unknown; } = {};

  private static settingConfig: { [settingKey in keyof AvailableSettings]: SettingConfiguration<AvailableSettings[settingKey]> } = {
    oAuthToken: {},
    userName: {},
    password: {},
  }

  @Column()
  public key: string;

  @Column()
  public value: string;

  /**
   * Insert default values for all missing setting keys
   * @param  {Function} callback Optional callback function
   */
  public static async addDefaultsForMissingKeys(): Promise<void> {
    const settings = <Array<Setting>> await Setting.all().list();

    for (const settingKey of <Array<keyof AvailableSettings>> Object.keys(this.settingConfig)) {
      const settingConfig = this.settingConfig[settingKey];

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

  public static async remove<PropertyKey extends keyof AvailableSettings>(key: PropertyKey): Promise<void> {
    Setting.settingsCache[key] = undefined;
    const setting = await Setting.findBy('key', key);
    if (setting) {
      await setting.delete();
    }
  }

  public saveValue(value: string): Promise<void> {
    this.value = value;
    return this.save();
  }
}

export interface AvailableSettings {
  oAuthToken: string;
  userName: string;
  password: string;
}

export interface SettingConfiguration<T = unknown> {
  default?: T;
}
