import { PersistenceModel, AppModel, Column } from 'src/app/utils/orm';
import { HasMany, HasOne } from 'src/app/utils/orm/app-model';
import { GroupOrderArticle } from './group-order-article';
import { Order } from './order';

@PersistenceModel('GroupOrder')
export class GroupOrder extends AppModel {
  @HasOne('Order') public order: Order;

  @HasMany('GroupOrderArticle') public groupOrderArticles: GroupOrderArticle[];

  @Column() public orderId: string;

  @Column() public orderGroupId: string;
}
