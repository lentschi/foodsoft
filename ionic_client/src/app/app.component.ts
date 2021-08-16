import { ChangeDetectionStrategy, Component, Type, OnDestroy, OnInit } from '@angular/core';
import { ModalController } from '@ionic/angular';
import { TranslateService } from '@ngx-translate/core';
import { Observable, Subject } from 'rxjs';
import { SettingsDialogComponent } from './dialogs/settings-dialog/settings-dialog.component';

@Component({
  selector: 'app-root',
  templateUrl: 'app.component.html',
  styleUrls: ['app.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AppComponent implements OnDestroy, OnInit {
  public readonly menuPoints: MenuPointConfig[] = [
    {
      name$: this.translateService.stream('settings'),
      modalComponent: SettingsDialogComponent,
    },
  ];

  private destroy$ = new Subject<void>();

  public constructor(private readonly translateService: TranslateService, private readonly modalController: ModalController) {
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
}

interface MenuPointConfig {
  name$: Observable<string>;
  modalComponent?: Type<unknown>;
  onDidDismiss?: (data: unknown) => void;
}
