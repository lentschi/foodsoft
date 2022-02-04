import { APP_INITIALIZER, NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { RouteReuseStrategy } from '@angular/router';

import { IonicModule, IonicRouteStrategy } from '@ionic/angular';
import { SplashScreen } from '@ionic-native/splash-screen/ngx';
import { StatusBar } from '@ionic-native/status-bar/ngx';

import { AppComponent } from './app.component';
import { AppRoutingModule } from './app-routing.module';
import { HttpClientModule } from '@angular/common/http';
import { httpInterceptorProviders } from './http-interceptors';
import { LoginFormComponent } from './dialogs/login-form/login-form.component';
import { ReactiveFormsModule } from '@angular/forms';
import { IndexedMigrationsModule } from 'src/config/indexed-migrations/indexed-migrations.module';
import { DbManager } from './services/db-manager';
import { LoginService } from './services/login.service';
import { SettingsDialogComponent } from './dialogs/settings-dialog/settings-dialog.component';
import { SettingBooleanComponent } from './dialogs/settings-dialog/inline-components/boolean/setting-boolean.component';
import { SettingsService } from './services/settings.service';
import { UserApiService } from './services/api/user-api.service';
import { MainMenuComponent } from './components/main-menu/main-menu.component';
import { CommonModule } from '@angular/common';
import { ProfileMenuItemComponent } from './pages/orders/components/profile-menu-item/profile-menu-item.component';
import { SharedModule } from './shared.module';
import { ServiceWorkerModule } from '@angular/service-worker';
import { WebPushNotificationEndpointsApiService } from './services/api/webpush-notification-endpoints-api.service';


const initializeAppFactory = (dbManager: DbManager) => (): Promise<void> => dbManager.initialize();

@NgModule({
  declarations: [AppComponent, LoginFormComponent, SettingsDialogComponent, SettingBooleanComponent, MainMenuComponent, ProfileMenuItemComponent],
  entryComponents: [SettingBooleanComponent, ProfileMenuItemComponent],
  imports: [
    CommonModule,
    BrowserModule,
    IonicModule.forRoot(),
    HttpClientModule,
    AppRoutingModule,
    ReactiveFormsModule,
    IndexedMigrationsModule,
    SharedModule,
    ServiceWorkerModule.register('ngsw-worker.js', {
      enabled: true,

      // Register the ServiceWorker as soon as the app is stable
      // or after 30 seconds (whichever comes first).
      registrationStrategy: 'registerWhenStable:30000',
    }),
  ],
  providers: [
    StatusBar,
    SplashScreen,
    DbManager,
    LoginService,
    SettingsService,
    UserApiService,
    WebPushNotificationEndpointsApiService,
    httpInterceptorProviders,
    { provide: RouteReuseStrategy, useClass: IonicRouteStrategy },
    {
      provide: APP_INITIALIZER,
      useFactory: initializeAppFactory,
      multi: true,
      deps: [DbManager],
    },
  ],
  bootstrap: [AppComponent],
})
export class AppModule {}
