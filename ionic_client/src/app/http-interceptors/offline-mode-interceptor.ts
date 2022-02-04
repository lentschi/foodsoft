import { HttpInterceptor, HttpRequest, HttpHandler, HttpEvent } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { Setting } from '../models/orm/setting';
import { OfflineModeError } from '../services/api/errors/offline-mode-error';
import { SettingsService } from '../services/settings.service';

@Injectable()
export class OfflineModeInterceptor implements HttpInterceptor {
  public constructor(private readonly settingsService: SettingsService) {}

  public intercept(req: HttpRequest<unknown>, next: HttpHandler): Observable<HttpEvent<unknown>> {
    if (req.url.startsWith(this.settingsService.getBaseUrlWithoutFoodcoop()) && Setting.cached('offlineMode')) {
      throw new OfflineModeError();
    }
    return next.handle(req);
  }
}
