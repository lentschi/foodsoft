import { ChangeDetectionStrategy, Component, EventEmitter, Input, Output } from '@angular/core';
import { Setting } from 'src/app/models/orm/setting';
import { User } from 'src/app/models/orm/user';
import StyleUtil from 'src/app/utils/misc/style-util';
import { UserDetailsComponent } from '../user-details/user-details.component';

@Component({ selector: 'app-user-avatar',
  templateUrl: './user-avatar.component.html',
  styleUrls: ['./user-avatar.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush })
export class UserAvatarComponent {
  @Input() public user?: User;

  @Input() public withName?: boolean;

  @Input() public noUserLabel?: string;

  @Input() public actionIcon?: string;

  @Output() public actionIconClick = new EventEmitter<MouseEvent>();

  public readonly UserDetailsComponent = UserDetailsComponent;

  // TODO-no-upstream
  public readonly baseUrl = `${window.location.href.split('/')
    .slice(0, 3)
    .join('/')
  }/server`;

  public getUserInitialsColor(user: User): string {
    return StyleUtil.stringToColour(user.name);
  }

  public get isCurrentUser(): boolean {
    return Setting.cached('userId') === this.user?.id;
  }

  public get chipColor(): string {
    if (!this.user) {
      return 'danger';
    }

    if (this.isCurrentUser) {
      return 'primary';
    }

    return 'dark';
  }
}


