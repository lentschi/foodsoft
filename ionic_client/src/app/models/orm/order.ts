import { HasMany, HasOne } from 'src/app/utils/orm/app-model';
import { QueryRelations } from 'src/app/utils/orm/query-collection';
import { PersistenceModel, AppModel, Column } from '../../utils/orm';
import { OrderState } from '../enums/order-state';
import { OrderArticle } from './order-article';
import { Supplier } from './supplier';
import { Task } from './task';

@PersistenceModel('Order')
export class Order extends AppModel {
  @HasOne('Supplier')
  public supplier: Supplier;

  @HasOne('Task')
  public task?: Task;

  @HasMany('OrderArticle')
  public orderArticles: OrderArticle[];

  @Column()
  public supplierId: string;

  @Column()
  public ownGroupOrderId?: number;

  @Column()
  public taskId?: string;

  @Column()
  public name: string;

  @Column()
  public starts: Date;

  @Column()
  public ends?: Date;

  @Column()
  public pickup?: Date;

  @Column()
  public state: OrderState;

  public get finished(): boolean {
    return [OrderState.finished, OrderState.received, OrderState.closed].includes(this.state);
  }

  public get closed(): boolean {
    return this.state === OrderState.closed;
  }

  public static get taskInclude(): QueryRelations<keyof Order> {
    const include = new Map<keyof Order, QueryRelations<string>>();
    include.set('task', Task.usersInclude);

    return include;
  }
}
