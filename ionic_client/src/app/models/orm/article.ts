import { PersistenceModel, AppModel, Column } from 'src/app/utils/orm';

@PersistenceModel('Article')
export class Article extends AppModel {
  @Column() public name: string;

  @Column() public supplierId: string;

  @Column() public supplierName: string;

  @Column() public unit: string;

  @Column() public unitQuantity: number;

  @Column() public manufacturer: string;

  @Column() public origin: string;

  @Column() public articleCategoryId: string;
}
