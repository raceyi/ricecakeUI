import { Component, ViewChild, Input } from '@angular/core';
import { IonicPage, NavController, NavParams, LoadingController, AlertController, App, Slides } from 'ionic-angular';
import { HomePage } from '../home/home';
import { Page3Page } from '../page3/page3';

/**
 * Generated class for the Page2Page page.
 *
 * See https://ionicframework.com/docs/components/#navigation for more info on
 * Ionic pages and navigation.
 */

@IonicPage()
@Component({
  selector: 'page-page2',
  templateUrl: 'page2.html',
})
export class Page2Page {

  constructor(public navCtrl: NavController, public navParams: NavParams,
    public loadingCtrl: LoadingController,
    public alertCtrl: AlertController,
    public app: App
  ) {}

  homePage(){
    this.app.getRootNavs()[0].setRoot(HomePage);
  }
  
  trashPage(){
    this.app.getRootNavs()[0].setRoot(Page3Page);
  }


  checkPassword(){
    
  }

  ionViewDidLoad() {
    console.log('ionViewDidLoad Page2Page');
  }


}
