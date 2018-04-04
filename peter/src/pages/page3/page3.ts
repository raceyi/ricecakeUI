import { Component } from '@angular/core';
import { IonicPage, NavController} from 'ionic-angular';

import { Page4Page } from '../page4/page4';

@IonicPage()
@Component({
  selector: 'page-page3',
  templateUrl: 'page3.html',
})
export class Page3Page {
  currentPage = 'Page3Page';
  constructor(public navCtrl: NavController) {
  }

  ionViewDidLoad() {
    console.log('ionViewDidLoad Page3Page');
  }
  openPage4(){
    this.navCtrl.push(Page4Page);
  }
}
