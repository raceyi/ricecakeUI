import { Component } from '@angular/core';

import { IonicPage, NavController, NavParams, AlertController } from 'ionic-angular';
import { App } from 'ionic-angular';

import {AppDataProvider} from '../../providers/app-data/app-data';

import { DuckMainPage } from '../duck-main/duck-main';

@IonicPage()

@Component({
  selector: 'page-baedal',
  templateUrl: 'baedal.html',
})
export class BaedalPage {
  currentPage='DuckMainPage';
  
  deliveryman:string;

  deliverymanList=[];

  constructor(public app:App, public navCtrl: NavController, public navParams: NavParams, public alertCtrl: AlertController, public appDataProvider:AppDataProvider){
  }

  ionViewDidLoad(){
    console.log('ionViewDidLoad BaedalPage');
   }
  openDuckMainPage(){
    console.log("openDuckMainPage");
    this.app.getRootNavs()[0].setRoot(DuckMainPage);
    setTimeout(()=> { this.currentPage='DuckMainPage';}, 500);
  }
  
  deleteconfirm(i){
    let confirm = this.alertCtrl.create({
      title: '배달자를 삭제하시겠습니까?',
      message: '배달자를 정말 삭제하시겠습니까?',
      buttons: [
        {
          text: '취소',
          handler: () => {
            console.log('Cancel');
          }
        },
        {
          text: '확인',
          handler: () => {
            console.log('Agree');
            this.appDataProvider.deliverymanList.splice(i,1)
          }
        }
      ]
    });
    confirm.present();
  }
  savedeliverymanadd(){
    let deliverymanadd={deliveryman: this.deliveryman};
    this.appDataProvider.deliverymanList.push(deliverymanadd);
    console.log(JSON.stringify(this.deliverymanList));
  }
}
