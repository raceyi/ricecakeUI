import { Component } from '@angular/core';
import { IonicPage, NavController, NavParams, Icon, AlertController } from 'ionic-angular';
import { Platform, ActionSheetController } from 'ionic-angular'
import { HomePage } from '../home/home';
import { Page2Page } from '../page2/page2';
import { App } from 'ionic-angular/components/app/app';


/**
 * Generated class for the Page3Page page.
 *
 * See https://ionicframework.com/docs/components/#navigation for more info on
 * Ionic pages and navigation.
 */

@IonicPage()
@Component({
  selector: 'page-page3',
  templateUrl: 'page3.html',
})
export class Page3Page {


  constructor(public navCtrl: NavController, public navParams: NavParams, public platform: Platform,
    public alertCtrl: AlertController, public app: App
    ) {}
    
    ionViewDidLoad() {
      console.log('ionViewDidLoad Page3Page');
    }

    homePage(){
      this.app.getRootNavs()[0].setRoot(HomePage);
    }

    adminPage(){
      this.app.getRootNavs()[0].setRoot(Page2Page);
    }

    doConfirmRemoveTrash(){
      const alert = this.alertCtrl.create({
        title: '영구 삭제 하시겠습니까?',
        message: '영구 삭제된 주문은 복원 할 수 없습니다.',
        buttons: [
          {
            text: '취소',
            handler: () => {
              console.log('Disagree clicked');
            }
          },
          {
            text: '삭제',
            handler: () => {
              console.log('Agree clicked');
            }
          }
        ]
      });
      alert.present();
    }
}
