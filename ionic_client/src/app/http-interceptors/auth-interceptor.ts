import { HttpInterceptor, HttpRequest, HttpHandler, HttpEvent } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { ModalController } from '@ionic/angular';
import { Observable } from 'rxjs';
import { LoginFormComponent } from '../auth/login-form/login-form.component';

@Injectable()
export class AuthInterceptor implements HttpInterceptor {
  constructor(private readonly modalController: ModalController) {}

  intercept(req: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
    const authToken = localStorage.getItem('oAuthToken');

    // Clone the request and replace the original headers with
    // cloned headers, updated with the authorization.
    const authReq = req.clone({
      setParams: {
        'access_token': authToken
      }
    });

    // this.modalController.create({component: LoginFormComponent}).then(modal => modal.present());

    //TODO: https://gist.github.com/Gribanov/c6cce5a563ca0ba55591f15a96312db5

    // send cloned request with header to the next handler.
    return next.handle(authReq);
  }
}