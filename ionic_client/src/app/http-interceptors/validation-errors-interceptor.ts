import { HttpErrorResponse, HttpEvent, HttpHandler, HttpInterceptor, HttpRequest } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { isArray } from 'lodash';
import { Observable, throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { ServerValidationError } from '../services/api/errors/server-validation-error';
import { AppModel } from '../utils/orm';

@Injectable()
export class ValidationErrorsInterceptor implements HttpInterceptor {
  public intercept(request: HttpRequest<unknown>, next: HttpHandler): Observable<HttpEvent<unknown>> {
    let stream$ = next.handle(request);

    if (['put', 'post', 'patch'].includes(request.method.toLowerCase())) {
      stream$ = stream$.pipe(catchError(handleError));
    }

    return stream$;
  }
}

const handleError = (e: Error): Observable<never> => {
  if (e instanceof HttpErrorResponse && e.status === 400 && isArray(e.error.errors)) {
    const map =  new Map<keyof AppModel, string>();
    for (const error of e.error.errors) {
      map.set(error.id, error.title);
    }
    return throwError(new ServerValidationError(map));
  }
  return throwError(e);
};
