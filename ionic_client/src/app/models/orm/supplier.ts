import { PersistenceModel, AppModel, Column } from 'src/app/utils/orm';
import { HasMany, HasOne } from 'src/app/utils/orm/app-model';
import { QueryRelations } from 'src/app/utils/orm/query-collection';
import { Article } from './article';
import { OrderRepetitionSetting } from './order-repetition-setting';

@PersistenceModel('Supplier')
export class Supplier extends AppModel {
  @HasMany('Article') public articles: Article[];

  @HasOne('OrderRepetitionSetting')
  public orderRepetitionSetting?: OrderRepetitionSetting;

  @Column() public name: string;

  @Column()
  public orderRepetitionSettingId?: string;

  public static get orderRepititionSettingsInclude(): QueryRelations<keyof Supplier> {
    const include = new Map<keyof Supplier, QueryRelations<string>>();
    include.set('orderRepetitionSetting', new Map<keyof OrderRepetitionSetting, QueryRelations<string>>());

    return include;
  }
}
