import { AppModel, Column, PersistenceModel } from 'src/app/utils/orm';

@PersistenceModel('OrderRepetitionSetting')
export class OrderRepetitionSetting extends AppModel {
  @Column()
  public startsAt: Date;

  @Column()
  public frequency: number;

  @Column()
  public pickupOffset: number;
}
