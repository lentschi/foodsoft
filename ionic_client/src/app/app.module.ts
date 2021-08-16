import { APP_INITIALIZER, NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { RouteReuseStrategy } from '@angular/router';

import { IonicModule, IonicRouteStrategy } from '@ionic/angular';
import { SplashScreen } from '@ionic-native/splash-screen/ngx';
import { StatusBar } from '@ionic-native/status-bar/ngx';

import { AppComponent } from './app.component';
import { AppRoutingModule } from './app-routing.module';
import { HttpClient, HttpClientModule } from '@angular/common/http';
import { httpInterceptorProviders } from './http-interceptors';
import { LoginFormComponent } from './dialogs/login-form/login-form.component';
import { ReactiveFormsModule } from '@angular/forms';
import { IndexedMigrationsModule } from 'src/config/indexed-migrations/indexed-migrations.module';
import { DbManager } from './services/db-manager';
import { LoginService } from './services/login.service';
import { TranslateLoader, TranslateModule } from '@ngx-translate/core';
import { TranslateHttpLoader } from '@ngx-translate/http-loader';
import { SettingsDialogComponent } from './dialogs/settings-dialog/settings-dialog.component';
import { SettingBooleanComponent } from './dialogs/settings-dialog/inline-components/boolean/setting-boolean.component';
import { SettingsService } from './services/settings.service';


const initializeAppFactory = (dbManager: DbManager) => (): Promise<void> => dbManager.initialize();

const createTranslateLoader = (http: HttpClient): TranslateHttpLoader => new TranslateHttpLoader(http, '../assets/i18n/', '.json');

@NgModule({
  declarations: [AppComponent, LoginFormComponent, SettingsDialogComponent, SettingBooleanComponent],
  entryComponents: [SettingBooleanComponent],
  imports: [
    BrowserModule,
    IonicModule.forRoot(),
    HttpClientModule,
    AppRoutingModule,
    ReactiveFormsModule,
    IndexedMigrationsModule,
    TranslateModule.forRoot({
      loader: {
        provide: TranslateLoader,
        useFactory: createTranslateLoader,
        deps: [HttpClient],
      },
    }),
  ],
  providers: [
    StatusBar,
    SplashScreen,
    DbManager,
    LoginService,
    SettingsService,
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
