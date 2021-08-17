import { PersistenceModel, AppModel, Column } from '../../utils/orm';
import { OrderState } from '../enums/order-state';

@PersistenceModel('Order')
export class Order extends AppModel {
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
