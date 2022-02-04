import { Injectable } from '@angular/core';
import { AlertController } from '@ionic/angular';
import { TranslateService } from '@ngx-translate/core';

@Injectable()
export class AlertService {
  public constructor(private readonly alertController: AlertController, private readonly translateService: TranslateService) {}

  public confirm(question: string, header = '', yesLabel = this.translateService.instant('yes'), noLabel = this.translateService.instant('no')): Promise<boolean> {
    // eslint-disable-next-line no-async-promise-executor
    return new Promise<boolean>(async resolve => {
      const alert = await this.alertController.create({
        header,
        message: question,
        buttons: [
          {
            text: noLabel,
            role: 'cancel',
            cssClass: 'secondary',
            handler: (): void => resolve(false),
          },
          {
            text: yesLabel,
            handler: (): void => resolve(true),
          },
        ],
      });
      await alert.present();
    });
  }
}
