import { HttpErrorResponse, HttpEvent, HttpHandler, HttpInterceptor, HttpRequest } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable, throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { ServerValidationError } from '../services/api/errors/server-validation-error';
import { ToastService } from '../services/toast.service';

@Injectable()
export class ConnectionFailureInterceptor implements HttpInterceptor {
  public constructor(private readonly toastService: ToastService) {}

  public intercept(request: HttpRequest<unknown>, next: HttpHandler): Observable<HttpEvent<unknown>> {
    return next.handle(request).pipe(catchError(e => {
      if (!(e instanceof ServerValidationError) && (!(e instanceof HttpErrorResponse) || e.status !== 401)) {
        // TODO: Present offline mode / repeat request choice instead:
        void this.toastService.present('Unexpected server communication error', 'danger');
      }
      return throwError(e);
    }));
  }
}
