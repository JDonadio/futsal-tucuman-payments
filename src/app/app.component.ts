import { Component } from '@angular/core';

import { Platform } from '@ionic/angular';
import { SplashScreen } from '@ionic-native/splash-screen/ngx';
import { StatusBar } from '@ionic-native/status-bar/ngx';
import { AuthService } from './services/auth.service';
import { Router } from '@angular/router';
import { SharingService } from './services/sharing.service';

@Component({
  selector: 'app-root',
  templateUrl: 'app.component.html'
})
export class AppComponent {
  public isLoggedIn: boolean;

  public appPages = [
    {
      title: 'Home',
      url: '/home',
      icon: 'home'
    }
  ];

  constructor(
    private platform: Platform,
    private splashScreen: SplashScreen,
    private statusBar: StatusBar,
    private authService: AuthService,
    private sharingService: SharingService,
    private myRouter: Router,
  ) {
    this.sharingService.currentUser.subscribe(user => {
      this.isLoggedIn = user;
    })
    this.initializeApp();
  }

  initializeApp() {
    this.platform.ready().then(() => {
      this.statusBar.styleDefault();
      this.splashScreen.hide();
    });
  }

  login() {
    this.myRouter.navigate(['/login']);
  }

  add() {
    this.myRouter.navigate(['/add']);
  }

  logout() {
    this.authService.logout();
  }
}
