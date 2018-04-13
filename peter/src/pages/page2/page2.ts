import { Component } from '@angular/core';
import { IonicPage, NavController} from 'ionic-angular';
import { Page1Page } from '../page1/page1';
import { Page3Page } from '../page3/page3';
@IonicPage()
@Component({
  selector: 'page-page2',
  templateUrl: 'page2.html',
})
export class Page2Page {
  currentPage = 'Page3Page';
  constructor(public navCtrl: NavController) {
  }

  ionViewDidLoad() {
    console.log('ionViewDidLoad Page2Page');
  }

  backtoPage1(){
    this.navCtrl.push(Page1Page);
  }
  openPage3(){
    this.navCtrl.push(Page3Page);
    }
}
