import { PersistenceModel, AppModel, Column } from 'src/app/utils/orm';

@PersistenceModel('User')
export class User extends AppModel {
  @Column() public avatarUrl?: string;

  @Column() public name: string;

  public get initials(): string {
    const parts = this.name.split(' ');
    return parts.map(part => part.substr(0, 1))
      .slice(0, 2)
      .map(character => character.toUpperCase())
      .join('');
  }
}
