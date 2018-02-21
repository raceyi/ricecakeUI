import { Component } from '@angular/core';
import { Platform, App } from 'ionic-angular';
import { StatusBar } from '@ionic-native/status-bar';
import { SplashScreen } from '@ionic-native/splash-screen';

import { HomePage } from '../pages/home/home';
import {DuckMainPage} from '../pages/duck-main/duck-main';
import {ProductionPage} from '../pages/production/production';
import {AdministratorPage} from '../pages/administrator/administrator';
import {GarbagePage} from '../pages/garbage/garbage';
import {MaechulPage} from '../pages/maechul/maechul';
@Component({
  templateUrl: 'app.html'
})
export class MyApp {
  rootPage:any = DuckMainPage;
  currentPage='AministratorPage';
  
  checkPageHidden(page){
    if(this.currentPage==page){
        return true;
    }
    return false;
  }

  openAdministratorPage(){
    console.log("openAdministratorPage");
    this.app.getRootNavs()[0].setRoot(AdministratorPage);
    setTimeout(()=> { this.currentPage='AdministratorPage';}, 500);
    }

  openGarbagePage(){
    console.log("openGarbagePage");
    this.app.getRootNavs()[0].setRoot(GarbagePage);
    setTimeout(() => { this.currentPage='GarbagePage';}, 500);
    }

  constructor(private app: App, private platform: Platform, statusBar: StatusBar, splashScreen: SplashScreen) {
    platform.ready().then(() => {
      // Okay, so the platform is ready and our plugins are available.
      // Here you can do any higher level native things you might need.
      statusBar.styleDefault();
      splashScreen.hide();
    });
  }

  

}

