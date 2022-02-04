import { HttpInterceptor, HttpRequest, HttpHandler, HttpEvent, HttpErrorResponse } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { SwPush } from '@angular/service-worker';
import { ModalController } from '@ionic/angular';
import { from, Observable } from 'rxjs';
import { webPushPublicServerKey } from 'src/config/client-id';
import { LoginFormComponent } from '../dialogs/login-form/login-form.component';
import { Setting } from '../models/orm/setting';
import { WebPushNotificationEndpointsApiService } from '../services/api/webpush-notification-endpoints-api.service';
import { LoginService } from '../services/login.service';
import { SettingsService } from '../services/settings.service';

@Injectable()
export class AuthInterceptor implements HttpInterceptor {
  private triedSettingUpNotifications = false;

  public constructor(private readonly modalController: ModalController, private readonly loginService: LoginService, private readonly settingsService: SettingsService,  private readonly swPush: SwPush, private readonly webPushNotificationEndpointsApiService: WebPushNotificationEndpointsApiService) { }

  public intercept(req: HttpRequest<unknown>, next: HttpHandler): Observable<HttpEvent<unknown>> {
    if (!req.url.startsWith(this.settingsService.getBaseUrlWithoutFoodcoop())) {
      return next.handle(req);
    }

    // TODO make this reactive - see: https://gist.github.com/Gribanov/c6cce5a563ca0ba55591f15a96312db5
    return from(this.callAndAuthIfRequired(req, next));
  }

  private async callAndAuthIfRequired(req: HttpRequest<unknown>, next: HttpHandler): Promise<HttpEvent<unknown>> {
    let authToken = Setting.cached('oAuthToken', true);
    if (authToken === undefined) {
      authToken = await this.requestUserLogin();
      await Setting.set('oAuthToken', authToken);
    }

    const authReq = req.clone({
      setParams: {
        access_token: authToken,
      },
    });

    let response: HttpEvent<unknown>;

    try {
      response = await next.handle(authReq).toPromise();
    } catch (e) {
      if (e instanceof HttpErrorResponse && e.status === 401 && e.error?.error === 'invalid_token') {
        await Setting.remove('oAuthToken');
        response = await this.callAndAuthIfRequired(req, next);
      } else {
        throw e;
      }
    }

    // Try to set up user notification if this has been the first successful API call:
    if (!this.triedSettingUpNotifications) {
      await this.setupUserNotifications();
    }

    return response;
  }

  private async setupUserNotifications(): Promise<void> {
    this.triedSettingUpNotifications = true;

    try {
      const subscription = await this.swPush.requestSubscription({ serverPublicKey: webPushPublicServerKey });
      console.log('subscription', subscription.toJSON());
      const id = await this.webPushNotificationEndpointsApiService.update(subscription);

      const cachedId = Setting.cached('wepPushNotificationEndpointId', true);
      if (cachedId !== undefined && cachedId !== id) {
        await this.webPushNotificationEndpointsApiService.delete(cachedId);
        await Setting.remove('wepPushNotificationEndpointId');
      }

      await Setting.set('wepPushNotificationEndpointId', id);
    } catch (e) {
      console.error('Setting up notifications failed', e);
    }
  }

  private async requestUserLogin(): Promise<string> {
    try {
      const accessToken = await this.loginService.autoLogin();
      return accessToken;
    } catch (e) {
      const loginModal = await this.modalController.create({ component: LoginFormComponent, componentProps: { initialError: e } });
      await loginModal.present();
      const loginOverlayEventDetail = await loginModal.onDidDismiss<LoginData>();
      if (!loginOverlayEventDetail.data) {
        throw e;
      }
      return loginOverlayEventDetail.data.accessToken;
    }
  }
}

interface LoginData {
  accessToken: string;
}
