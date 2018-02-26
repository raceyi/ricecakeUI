import { Component } from '@angular/core';

import { StatusBar } from '@ionic-native/status-bar';
import { SplashScreen } from '@ionic-native/splash-screen';

import { Platform, App } from 'ionic-angular';

import {DuckMainPage} from '../pages/duck-main/duck-main';
import {AdministratorPage} from '../pages/administrator/administrator';
import {GarbagePage} from '../pages/garbage/garbage';
import {BaedalPage} from '../pages/baedal/baedal';

@Component({
  templateUrl: 'app.html'
})

export class MyApp {
  rootPage:any = DuckMainPage;
    
  constructor(private app: App, private platform: Platform, statusBar: StatusBar, splashScreen: SplashScreen) {
    platform.ready().then(() => {
      // Okay, so the platform is ready and our plugins are available.
      // Here you can do any higher level native things you might need.
      statusBar.styleDefault();
      splashScreen.hide();
    });
  }
}

