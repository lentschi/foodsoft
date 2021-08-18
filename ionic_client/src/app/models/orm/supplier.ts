import { PersistenceModel, AppModel, Column } from 'src/app/utils/orm';

@PersistenceModel('Supplier')
export class Supplier extends AppModel {
  @Column() public name: string;
}
