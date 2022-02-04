import { Injectable } from '@angular/core';
import { ToastController } from '@ionic/angular';
import { Components } from '@ionic/core';

@Injectable()
export class ToastService {
  public constructor(private readonly toastController: ToastController) {}

  public async present(message: string, color = 'success', duration = 2000): Promise<Components.IonToast> {
    const toast = await this.toastController.create({ message, color, duration });
    await toast.present();

    return toast;
  }
}
