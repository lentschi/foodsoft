import { PersistenceModel, AppModel, Column, HasOne } from 'src/app/utils/orm';
import { Supplier } from './supplier';

@PersistenceModel('Article')
export class Article extends AppModel {
  @HasOne('Supplier') public supplier: Supplier;

  @Column() public supplierId: string;

  @Column() public name: string;

  @Column() public supplierName: string;

  @Column() public unit: string;

  @Column() public unitQuantity: number;

  @Column() public manufacturer: string;

  @Column() public origin: string;

  @Column() public articleCategoryId: string;
}
