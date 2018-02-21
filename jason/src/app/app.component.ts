import { Component } from '@angular/core';
import { Platform } from 'ionic-angular';
import { StatusBar } from '@ionic-native/status-bar';
import { SplashScreen } from '@ionic-native/splash-screen';
import { App } from 'ionic-angular'
import { HomePage } from '../pages/home/home';
import {Page2Page} from '../pages/page2/page2';
import {Page3Page} from '../pages/page3/page3';

@Component({
  templateUrl: 'app.html'
})
export class MyApp {
  rootPage:any = HomePage;
  currentPage='HomePage';

  checkPageHidden(page){
    if(this.currentPage==page){
      return true;
    }
    return false;
  }

  openHomePage(){
    console.log("openHomePage");
    this.currentPage="HomePage";
    this.app.getRootNavs()[0].setRoot(HomePage);
    setTimeout(() => { //workaround
      this.currentPage='HomePage';
    }, 500);
  }
  
  openPage2Page(){
    console.log("openPage2Page");
    this.app.getRootNavs()[0].setRoot(Page2Page);
    setTimeout(() => { //workaround
      this.currentPage='Page2Page';
    }, 500);
  }

  openPage3Page(){
    console.log("openPage3Page");
    this.app.getRootNavs()[0].setRoot(Page3Page);
    setTimeout(() => { //workaround
      this.currentPage='Page3Page';
    }, 500);
  }

  exit(){
    console.log("exit");
    this.platform.exitApp();
  }

  constructor(private platform: Platform, private app: App, statusBar: StatusBar, splashScreen: SplashScreen) {
    platform.ready().then(() => {
      // Okay, so the platform is ready and our plugins are available.
      // Here you can do any higher level native things you might need.
      statusBar.styleDefault();
      splashScreen.hide();
    });
  }
}

