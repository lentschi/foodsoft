import { HttpInterceptor, HttpRequest, HttpHandler, HttpEvent, HttpErrorResponse } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { ModalController } from '@ionic/angular';
import { from, Observable } from 'rxjs';
import { LoginFormComponent } from '../auth/login-form/login-form.component';

@Injectable()
export class AuthInterceptor implements HttpInterceptor {
  public constructor(private readonly modalController: ModalController) { }

  public intercept(req: HttpRequest<unknown>, next: HttpHandler): Observable<HttpEvent<unknown>> {
    // TODO make this responsive - see: https://gist.github.com/Gribanov/c6cce5a563ca0ba55591f15a96312db5
    return from(this.callAndAuthIfRequired(req, next));
  }

  private async callAndAuthIfRequired(req: HttpRequest<unknown>, next: HttpHandler): Promise<HttpEvent<unknown>> {
    let authToken = localStorage.getItem('oAuthToken');
    if (!authToken) {
      authToken = await this.requestUserLogin();
      localStorage.setItem('oAuthToken', authToken);
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
        localStorage.removeItem('oAuthToken');
        return this.callAndAuthIfRequired(req, next);
      }
      throw e;
    }
  }

  private async requestUserLogin(): Promise<string> {
    const loginModal = await this.modalController.create({ component: LoginFormComponent });
    await loginModal.present();
    const loginOverlayEventDetail = await loginModal.onDidDismiss<LoginData>();
    return loginOverlayEventDetail.data.accessToken;
  }
}

interface LoginData {
  accessToken: string;
}
