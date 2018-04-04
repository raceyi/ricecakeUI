import { Component } from '@angular/core';
import { IonicPage, NavController} from 'ionic-angular';
import { Page0Page } from '../page0/page0';
import { Page2Page } from '../page2/page2';

@IonicPage()
@Component({
  selector: 'page-page1',
  templateUrl: 'page1.html',
})
export class Page1Page {
  currentPage='Page1Page';
  constructor(public navCtrl: NavController) {
  }

  ionViewDidLoad() {
    console.log('ionViewDidLoad Page1Page');
  }

  backtoPage0(){
    this.navCtrl.push(Page0Page);
  }
  openPage2(){
    this.navCtrl.push(Page2Page);
  }
}
