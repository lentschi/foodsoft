import { Injectable } from '@angular/core';
import { LoadingController } from '@ionic/angular';
import { Components } from '@ionic/core';
import { TranslateService } from '@ngx-translate/core';

@Injectable()
export class LoaderService {
  public constructor(private readonly loadingController: LoadingController, private readonly translateService: TranslateService) {}

  public async present(): Promise<Components.IonLoading> {
    const loader = await this.loadingController.create({ message: this.translateService.instant('Please wait...') });
    await loader.present();

    return loader;
  }
}
