import { Component, ChangeDetectionStrategy, Inject } from '@angular/core';
import { Observable, of } from 'rxjs';
import { switchMap } from 'rxjs/operators';
import { menuItemConfigInjectionToken } from 'src/app/components/main-menu/main-menu-injection-tokens';
import { Setting } from 'src/app/models/orm/setting';
import { User } from 'src/app/models/orm/user';


@Component({
  selector: 'app-profile-menu-item',
  templateUrl: './profile-menu-item.component.html',
  styleUrls: ['./profile-menu-item.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ProfileMenuItemComponent  {
  public user$ = Setting.cached$('userId').pipe(switchMap(userId => userId ? User.findBy$('id', userId) : of(undefined)));

  public constructor(@Inject(menuItemConfigInjectionToken) public readonly menuItemConfig: {name$: Observable<string>; icon: string;}) {  }
}

