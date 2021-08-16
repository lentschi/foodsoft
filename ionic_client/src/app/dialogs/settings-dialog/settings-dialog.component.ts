import { ChangeDetectionStrategy, Component } from '@angular/core';
import { ModalController } from '@ionic/angular';

@Component({
  selector: 'app-settings-dialog',
  templateUrl: './settings-dialog.component.html',
  styleUrls: ['./settings-dialog.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class SettingsDialogComponent  {
  public constructor(public readonly modalCtrl: ModalController) {}
}
