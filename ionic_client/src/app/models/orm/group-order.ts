import { PersistenceModel, AppModel, Column } from 'src/app/utils/orm';
import { HasMany } from 'src/app/utils/orm/app-model';
import { GroupOrderArticle } from './group-order-article';

@PersistenceModel('GroupOrder')
export class GroupOrder extends AppModel {
  @HasMany('GroupOrderArticle') public groupOrderArticles: GroupOrderArticle[];

  @Column() public orderGroupId: string;
}
