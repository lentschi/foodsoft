import { HttpInterceptor, HttpRequest, HttpHandler, HttpEvent, HttpErrorResponse } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { ModalController } from '@ionic/angular';
import { from, Observable } from 'rxjs';
import { LoginFormComponent } from '../dialogs/login-form/login-form.component';
import { Setting } from '../models/orm/setting';
import { LoginService } from '../services/login.service';
import { SettingsService } from '../services/settings.service';

@Injectable()
export class AuthInterceptor implements HttpInterceptor {
  public constructor(private readonly modalController: ModalController, private readonly loginService: LoginService, private readonly settingsService: SettingsService) { }

  public intercept(req: HttpRequest<unknown>, next: HttpHandler): Observable<HttpEvent<unknown>> {
    if (!req.url.startsWith(this.settingsService.getBaseUrl())) {
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

    try {
      return await next.handle(authReq).toPromise();
    } catch (e) {
      if (e instanceof HttpErrorResponse && e.status === 401 && e.error?.error === 'invalid_token') {
        await Setting.remove('oAuthToken');
        return this.callAndAuthIfRequired(req, next);
      }
      throw e;
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
