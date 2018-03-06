import { Component } from '@angular/core';

import { IonicPage, NavController, NavParams, AlertController } from 'ionic-angular';
import { App } from 'ionic-angular';

import {DuckMainPage} from '../duck-main/duck-main';

import {AdministratorPage} from '../administrator/administrator';

@IonicPage()

@Component({
  selector: 'page-garbage',
  templateUrl: 'garbage.html',
})

export class GarbagePage {
  currentPage='DuckMainPage';
  
  constructor(private app:App, public navCtrl: NavController, public navParams: NavParams, public alertCtrl: AlertController) {
  }

  ionViewDidLoad() {
    console.log('ionViewDidLoad GarbagePage');
  }
  
  openDuckMainPage(){
    console.log("openDuckMainPage");
    this.app.getRootNavs()[0].setRoot(DuckMainPage);
    setTimeout(()=> { this.currentPage='DuckMainPage';}, 500);
  }
    
  openAdministratorPage(){
    console.log("AdministratorPage");
    this.app.getRootNavs()[0].setRoot(AdministratorPage);
    setTimeout(() => { this.currentPage='AdministratorPage';}, 500);
  }
  showConfirm() {
    let confirm = this.alertCtrl.create({
      title: '주문목록을 모두 지우시겠습니까?',
      message: '한 번 주문목록을 삭제하시면 다시 돌아오지 않습니다, 정말 삭제하시겠습니까?',
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
          }
        }
      ]
    });
    confirm.present();
  }
}

