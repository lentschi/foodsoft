import { PersistenceModel, AppModel, Column, HasOne } from 'src/app/utils/orm';
import { GroupOrder } from './group-order';
import { OrderArticle } from './order-article';

@PersistenceModel('GroupOrderArticle')
export class GroupOrderArticle extends AppModel {
  @HasOne('OrderArticle') public orderArticle: OrderArticle;

  @HasOne('GroupOrder') public groupOrder: GroupOrder;

  @Column() public orderArticleId: string;

  @Column() public groupOrderId: string;

  @Column() public quantity: number;

  @Column() public tolerance: number;
}
