import { Component } from '@angular/core';
import { HttpClient } from '@angular/common/http';

import { Platform } from '@ionic/angular';
import { SplashScreen } from '@ionic-native/splash-screen/ngx';
import { StatusBar } from '@ionic-native/status-bar/ngx';

@Component({
  selector: 'app-root',
  templateUrl: 'app.component.html',
  styleUrls: ['app.component.scss']
})
export class AppComponent {
  constructor(
    private platform: Platform,
    private splashScreen: SplashScreen,
    private statusBar: StatusBar,
    private httpClient: HttpClient
  ) {
    this.initializeApp();
  }

  initializeApp() {
    this.platform.ready().then(() => {
      this.statusBar.styleDefault();
      this.splashScreen.hide();
      this.httpClient.post('http://localhost:3000/ruebezahl17/oauth/authorize', {
        client_id: 'DrZvUGAKFZxgCt42vUjLgZZ32mrfhDZvRE7YQW7VnlQ',
        redirect_uri: 'urn:ietf:wg:oauth:2.0:oob',
        response_type: 'code'
      }).subscribe(r => {
        console.log('Result', r);
      });
    });
  }
}
