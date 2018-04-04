import { Component } from '@angular/core';
import { IonicPage, NavController, NavParams } from 'ionic-angular';

import { Page5Page} from '../page5/page5';
import { App } from 'ionic-angular';

@IonicPage()
@Component({
  selector: 'page-page4',
  templateUrl: 'page4.html',
})
export class Page4Page {
  currentPage = 'Page4Page';
  constructor(public navCtrl: NavController, public navParams: NavParams, private app: App){
  }

  ionViewDidLoad(){
    console.log('ionViewDidLoad Page4Page');
  }
  openPage5(){
    console.log("openPage5");
    this.app.getRootNavs()[0].setRoot(Page5Page);
    setTimeout(() => {this.currentPage='Page5Page';}, 500);
  }
}
