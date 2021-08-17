import { HasMany } from 'src/app/utils/orm/app-model';
import { PersistenceModel, AppModel, Column } from '../../utils/orm';
import { OrderState } from '../enums/order-state';
import { OrderArticle } from './order-article';

@PersistenceModel('Order')
export class Order extends AppModel {
  @HasMany('OrderArticle')
  public orderArticles: OrderArticle[];

  @Column()
  public name: string;

  @Column()
  public starts: Date;

  @Column()
  public ends?: Date;

  @Column()
  public pickup: Date;

  @Column()
  public state: OrderState;

  public get finished(): boolean {
    return [OrderState.finished, OrderState.received, OrderState.closed].includes(this.state);
  }

  public get closed(): boolean {
    return this.state === OrderState.closed;
  }
}
