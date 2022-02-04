import { Component, ChangeDetectionStrategy, Injector, OnDestroy, OnInit, Type } from '@angular/core';
import { ModalController } from '@ionic/angular';
import { TranslateService } from '@ngx-translate/core';
import { Subject, Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { SettingsDialogComponent } from 'src/app/dialogs/settings-dialog/settings-dialog.component';
import { Setting } from 'src/app/models/orm/setting';
import { ProfileMenuItemComponent } from 'src/app/pages/orders/components/profile-menu-item/profile-menu-item.component';
import { menuItemConfigInjectionToken } from './main-menu-injection-tokens';

@Component({
  selector: 'app-main-menu',
  templateUrl: './main-menu.component.html',
  styleUrls: ['./main-menu.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class MainMenuComponent implements OnDestroy, OnInit {
  public readonly menuPoints: MenuPointConfig[] = [
    {
      name$: this.translateService.stream('settings'),
      icon: 'settings-outline',
      modalComponent: SettingsDialogComponent,
    },
    {
      display$: Setting.cached$('userId').pipe(map(userId => userId !== undefined)),
      name$: this.translateService.stream('profile'),
      icon: 'person-outline',
      itemComponentType: ProfileMenuItemComponent,
      modalComponent: SettingsDialogComponent,
    },
  ];

  private destroy$ = new Subject<void>();

  public constructor(private readonly translateService: TranslateService, private readonly modalController: ModalController, public readonly injector: Injector) {
    this.assignMenuPointInjectors();
  }

  public ngOnInit(): void {
    this.translateService.setDefaultLang('de');
    this.translateService.use('de');
  }

  public ngOnDestroy(): void {
    this.destroy$.next();
  }

  public async openMenuPoint(menuPoint: MenuPointConfig): Promise<void> {
    if (menuPoint.modalComponent) {
      const modal = await this.modalController.create({ component: menuPoint.modalComponent });
      await modal.present();
      if (menuPoint.onDidDismiss) {
        const overlayEventDetail = await modal.onDidDismiss<unknown>();
        menuPoint.onDidDismiss.apply(this, overlayEventDetail.data);
      }
    }
  }

  public getItemComponentInjector(menuPoint: MenuPointConfig): Injector {
    const injector = Injector.create({
      providers: [
        {
          provide: menuItemConfigInjectionToken,
          useValue: { name$: menuPoint.name$, icon: menuPoint.icon },
        },
      ],
      parent: this.injector,
    });

    return injector;
  }

  private assignMenuPointInjectors(): void {
    for (const menuPoint of this.menuPoints) {
      if (menuPoint.itemComponentType) {
        menuPoint.itemInjector = this.getItemComponentInjector(menuPoint);
      }
    }
  }
}

interface MenuPointConfig {
  display$?: Observable<boolean>;
  name$: Observable<string>;
  icon: string;
  itemComponentType?: Type<unknown>;
  itemInjector?: Injector;
  modalComponent?: Type<unknown>;
  onDidDismiss?: (data: unknown) => void;
}
