import { HttpInterceptor, HttpRequest, HttpHandler, HttpEvent } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { ModalController } from '@ionic/angular';
import * as ClientOAuth2 from 'client-oauth2';
import { from, Observable } from 'rxjs';
import { subscribeOn, take } from 'rxjs/operators';
import { LoginFormComponent } from '../auth/login-form/login-form.component';

@Injectable()
export class AuthInterceptor implements HttpInterceptor {
  constructor(private readonly modalController: ModalController) {}

  intercept(req: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
    //TODO make this responsive - see: https://gist.github.com/Gribanov/c6cce5a563ca0ba55591f15a96312db5
    return from(new Promise<HttpEvent<any>>(async(resolve, reject) => {
      try {
        const response = await this.callAndAuthIfRequired(req, next);
        resolve(response);
      } catch(e) {
        reject(e);
      }
    }));
  }

  private async callAndAuthIfRequired(req: HttpRequest<any>, next: HttpHandler): Promise<HttpEvent<any>> {
    let authToken = localStorage.getItem('oAuthToken');
      if (authToken == null) {
        authToken = await this.requestUserLogin();
        localStorage.setItem('oAuthToken', authToken);
      }

      const authReq = req.clone({
        setParams: {
          'access_token': authToken
        }
      });

      try {
        return await next.handle(authReq).toPromise();
      } catch (e) {
        if (e.status === 401) {
          return await this.callAndAuthIfRequired(req, next);
        }
        throw e;
      }
  }

  private async requestUserLogin(): Promise<string> {
    const loginModal = await this.modalController.create({component: LoginFormComponent});
    await loginModal.present();
    const loginOverlayEventDetail = await loginModal.onDidDismiss<LoginData>();
    return loginOverlayEventDetail.data.accessToken;
  }
}

interface LoginData {
  accessToken: string;
}