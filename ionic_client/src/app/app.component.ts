import { Component, OnDestroy } from '@angular/core';
import { HttpClient } from '@angular/common/http';

import { Platform } from '@ionic/angular';
import { SplashScreen } from '@ionic-native/splash-screen/ngx';
import { StatusBar } from '@ionic-native/status-bar/ngx';
import { ActivatedRoute, Route } from '@angular/router';
import { Subject, race } from 'rxjs';
import { takeUntil } from 'rxjs/operators';

@Component({
  selector: 'app-root',
  templateUrl: 'app.component.html',
  styleUrls: ['app.component.scss']
})
export class AppComponent implements OnDestroy {
  private destroy$ = new Subject<void>();

  constructor(
    private platform: Platform,
    private splashScreen: SplashScreen,
    private statusBar: StatusBar,
    private httpClient: HttpClient,
    private route: ActivatedRoute,
  ) {
    this.initializeApp();
  }

  initializeApp() {
    this.platform.ready().then(() => {
      this.statusBar.styleDefault();
      this.splashScreen.hide();
      // this.httpClient.post('http://localhost:3000/ruebezahl17/oauth/authorize', {
      //   client_id: 'RhGguyvsjQOADrGiAix9Ds6uh2vjsHfUJFzWExuEw_Y',
      //   client_secret_id: 'mysecret',
      //   code: 'VUG6nhe_bjxdMR5wQ0METK01UkZbzcMlYYCR22ZR72E', // Obtained by calling http://localhost:3000/ruebezahl17/oauth/authorize?client_id=RhGguyvsjQOADrGiAix9Ds6uh2vjsHfUJFzWExuEw_Y&redirect_uri=urn%3Aietf%3Awg%3Aoauth%3A2.0%3Aoob&response_type=code&scope=
      //   redirect_uri: 'urn:ietf:wg:oauth:2.0:oob',
      //   response_type: 'code'
      // }).subscribe(r => {
      //   console.log('Result', r);
      // });

      // this.oidcSecurityService.checkAuth().subscribe((auth) => console.log('is authenticated', auth));
      // this.httpClient.post('http://localhost:3000/ruebezahl17/oauth/token', {
      //   client_id: 'RhGguyvsjQOADrGiAix9Ds6uh2vjsHfUJFzWExuEw_Y',
      //   client_secret_id: 'mysecret',
      //   code: 'VUG6nhe_bjxdMR5wQ0METK01UkZbzcMlYYCR22ZR72E', // Obtained by calling http://localhost:3000/ruebezahl17/oauth/authorize?client_id=RhGguyvsjQOADrGiAix9Ds6uh2vjsHfUJFzWExuEw_Y&redirect_uri=urn%3Aietf%3Awg%3Aoauth%3A2.0%3Aoob&response_type=code&scope=
      //   redirect_uri: 'urn:ietf:wg:oauth:2.0:oob',
      //   grant_type: 'authorization_code'
      // }).subscribe(r => {
      //   console.log('Result', r);
      // });
    });
  }

  ngOnDestroy() {
    this.destroy$.next();
  }
}
