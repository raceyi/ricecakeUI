import { Component } from '@angular/core';
import { IonicPage, NavController} from 'ionic-angular';
import { Page1Page} from '../page1/page1';
import { Page2Page } from '../page2/page2';

@IonicPage()

@Component({
  selector: 'page-page0',
  templateUrl: 'page0.html',
})
export class Page0Page {
  currentPage = 'Page0Page';
  constructor(public navCtrl: NavController) {
  }
  
  ionViewDidLoad() {
    console.log('ionViewDidLoad Page0Page');
  }
  
//18년4월3일 진작에 이렇게 간단하게 쓸 걸 그랬네;; 페이지 넘기는 거 코드 타이핑 하는 게 이렇게 쉬울 줄 꿈에도 몰랐는데 ㅠㅠㅠ

  openPage1(){
    this.navCtrl.push(Page1Page);
  } 
  openPage2(){
    this.navCtrl.push(Page2Page);
  }
}
