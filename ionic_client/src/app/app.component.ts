import { Component, OnDestroy } from '@angular/core';
import { HttpClient } from '@angular/common/http';

import { Platform } from '@ionic/angular';
import { SplashScreen } from '@ionic-native/splash-screen/ngx';
import { StatusBar } from '@ionic-native/status-bar/ngx';
import { ActivatedRoute } from '@angular/router';
import { Subject } from 'rxjs';

@Component({
  selector: 'app-root',
  templateUrl: 'app.component.html',
  styleUrls: ['app.component.scss'],
})
export class AppComponent implements OnDestroy {
  private destroy$ = new Subject<void>();

  public constructor(
    private platform: Platform,
    private splashScreen: SplashScreen,
    private statusBar: StatusBar,
    private httpClient: HttpClient,
    private route: ActivatedRoute,
  ) {
    this.initializeApp();
  }

  public initializeApp(): void {
    this.platform.ready().then(() => {
      this.statusBar.styleDefault();
      this.splashScreen.hide();

      // this.httpClient.post('http://localhost:3000/ruebezahl17/oauth/authorize', {
      //   Client_id: 'RhGguyvsjQOADrGiAix9Ds6uh2vjsHfUJFzWExuEw_Y',
      //   Client_secret_id: 'mysecret',
      //   Code: 'VUG6nhe_bjxdMR5wQ0METK01UkZbzcMlYYCR22ZR72E', // Obtained by calling http://localhost:3000/ruebezahl17/oauth/authorize?client_id=RhGguyvsjQOADrGiAix9Ds6uh2vjsHfUJFzWExuEw_Y&redirect_uri=urn%3Aietf%3Awg%3Aoauth%3A2.0%3Aoob&response_type=code&scope=
      //   Redirect_uri: 'urn:ietf:wg:oauth:2.0:oob',
      //   Response_type: 'code'
      // }).subscribe(r => {
      //   Console.log('Result', r);
      // });

      // This.oidcSecurityService.checkAuth().subscribe((auth) => console.log('is authenticated', auth));
      // this.httpClient.post('http://localhost:3000/ruebezahl17/oauth/token', {
      //   Client_id: 'RhGguyvsjQOADrGiAix9Ds6uh2vjsHfUJFzWExuEw_Y',
      //   Client_secret_id: 'mysecret',
      //   Code: 'VUG6nhe_bjxdMR5wQ0METK01UkZbzcMlYYCR22ZR72E', // Obtained by calling http://localhost:3000/ruebezahl17/oauth/authorize?client_id=RhGguyvsjQOADrGiAix9Ds6uh2vjsHfUJFzWExuEw_Y&redirect_uri=urn%3Aietf%3Awg%3Aoauth%3A2.0%3Aoob&response_type=code&scope=
      //   Redirect_uri: 'urn:ietf:wg:oauth:2.0:oob',
      //   Grant_type: 'authorization_code'
      // }).subscribe(r => {
      //   Console.log('Result', r);
      // });
    });
  }

  public ngOnDestroy(): void {
    this.destroy$.next();
  }
}
