import { ChangeDetectionStrategy, Component, Input } from '@angular/core';
import { User } from 'src/app/models/orm/user';

@Component({
  selector: 'app-user-details',
  templateUrl: './user-details.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class UserDetailsComponent {
  @Input() public user: User;
}
