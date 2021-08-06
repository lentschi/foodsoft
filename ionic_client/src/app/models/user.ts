import { AppModel, Column } from '../utils/orm';

export class User extends AppModel {
  public static tableName = 'User';

  @Column('string')
  public name: string;
}
