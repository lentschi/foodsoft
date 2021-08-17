import { PersistenceModel, AppModel, Column, HasOne } from '../../utils/orm';
import { Article } from './article';
import { Order } from './order';

@PersistenceModel('OrderArticle')
export class OrderArticle extends AppModel {
  @HasOne('Order')
  public order: Order;

  @HasOne('Article')
  public article: Article;

  @Column()
  public orderId: string;

  @Column()
  public articleId: string;

  @Column()
  public price: number;

  @Column()
  public quantity: number;

  @Column()
  public tolerance: number;

  @Column()
  public unitsToOrder: number;
}
