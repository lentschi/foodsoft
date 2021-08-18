import { HasMany, HasOne } from 'src/app/utils/orm/app-model';
import { PersistenceModel, AppModel, Column } from '../../utils/orm';
import { OrderState } from '../enums/order-state';
import { GroupOrder } from './group-order';
import { OrderArticle } from './order-article';
import { Supplier } from './supplier';

@PersistenceModel('Order')
export class Order extends AppModel {
  @HasOne('Supplier')
  public supplier: Supplier;

  @HasOne('GroupOrder')
  public ownGroupOrder?: GroupOrder;

  @HasMany('OrderArticle')
  public orderArticles: OrderArticle[];

  @Column()
  public supplierId: string;

  @Column()
  public ownGroupOrderId: string;

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
