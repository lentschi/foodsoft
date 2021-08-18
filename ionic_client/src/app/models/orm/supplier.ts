import { PersistenceModel, AppModel, Column } from 'src/app/utils/orm';
import { HasMany } from 'src/app/utils/orm/app-model';
import { Article } from './article';

@PersistenceModel('Supplier')
export class Supplier extends AppModel {
  @HasMany('Article') public articles: Article[];

  @Column() public name: string;
}
