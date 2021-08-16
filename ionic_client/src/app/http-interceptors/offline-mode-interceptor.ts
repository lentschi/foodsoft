import { HttpInterceptor, HttpRequest, HttpHandler, HttpEvent } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { Setting } from '../models/orm/setting';
import { SettingsService } from '../services/settings.service';

@Injectable()
export class OfflineModeInterceptor implements HttpInterceptor {
  public constructor(private readonly settingsService: SettingsService) {}

  public intercept(req: HttpRequest<unknown>, next: HttpHandler): Observable<HttpEvent<unknown>> {
    if (req.url.startsWith(this.settingsService.getBaseUrl()) && Setting.cached('offlineMode')) {
      throw new Error('Offline mode');
    }
    return next.handle(req);
  }
}
