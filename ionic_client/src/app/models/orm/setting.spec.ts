import { Setting } from './setting';

describe('Setting', () => {
  describe('Removing settings', () => {
    it('given a setting exists, it should initiate removal from the db', async () => {
      const mockSetting = new Setting();
      spyOn(Setting, 'findBy').and.resolveTo(mockSetting);
      spyOn(mockSetting, 'delete').and.resolveTo();

      await Setting.remove('oAuthToken');
      expect(Setting.findBy).toHaveBeenCalledWith('key', 'oAuthToken');
      await expect(mockSetting.delete).toHaveBeenCalled();
    });

    it('given a setting doesn\'t exists, it should not initiate removal from the db (and no error should occurr)', async () => {
      spyOn(Setting, 'findBy').and.resolveTo(undefined);
      await Setting.remove('oAuthToken');
      expect(Setting.findBy).toHaveBeenCalledWith('key', 'oAuthToken');
    });
  });
});
