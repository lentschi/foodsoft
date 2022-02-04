import { PersistenceModel, AppModel } from 'src/app/utils/orm';
import { Column, HasAndBelongsToMany, HasOne } from 'src/app/utils/orm/app-model';
import { QueryRelations } from 'src/app/utils/orm/query-collection';
import { User } from './user';

@PersistenceModel('Task')
export class Task extends AppModel {
  @HasAndBelongsToMany('User') public users: User[];

  @HasOne('User') public responsibleUser?: User;

  @Column() public responsibleUserId?: string;

  public static get usersInclude(): QueryRelations<keyof Task> {
    const includes = new Map<keyof Task, QueryRelations<string>>();
    includes.set('users', new Map<keyof User, QueryRelations<string>>());
    includes.set('responsibleUser', new Map<keyof User, QueryRelations<string>>());

    return includes;
  }
}
