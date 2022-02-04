/* "Barrel" of Http Interceptors */
import { HTTP_INTERCEPTORS } from '@angular/common/http';
import { AuthInterceptor } from './auth-interceptor';
import { ConnectionFailureInterceptor } from './connection-failure-interceptor';
import { OfflineModeInterceptor } from './offline-mode-interceptor';
import { ValidationErrorsInterceptor } from './validation-errors-interceptor';


/** Http interceptor providers in outside-in order */
export const httpInterceptorProviders = [
  { provide: HTTP_INTERCEPTORS, useClass: AuthInterceptor, multi: true },
  { provide: HTTP_INTERCEPTORS, useClass: OfflineModeInterceptor, multi: true },
  { provide: HTTP_INTERCEPTORS, useClass: ConnectionFailureInterceptor, multi: true },
  { provide: HTTP_INTERCEPTORS, useClass: ValidationErrorsInterceptor, multi: true },
];
