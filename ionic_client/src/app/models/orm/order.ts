import { PersistenceModel, AppModel, Column } from '../../utils/orm';

@PersistenceModel('Order')
export class Order extends AppModel {
  @Column()
  public name: string;

  @Column()
  public starts: Date;

  @Column()
  public ends: Date;

  @Column()
  public pickup: Date;

  @Column()
  public isOpen: boolean;
}
