import { Component } from '@angular/core';
import { IonicPage, NavController, NavParams, Icon, AlertController } from 'ionic-angular';
import { Platform, ActionSheetController } from 'ionic-angular'


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
    public alertCtrl: AlertController
    ) {
      
    }
   

    doConfirmRemoveTrash(){
      const alert = this.alertCtrl.create({
        title: 'Want to remove all?',
        message: 'If you remove all of list, cannot recover it again.',
        buttons: [
          {
            text: 'Disagree',
            handler: () => {
              console.log('Disagree clicked');
            }
          },
          {
            text: 'Agree',
            handler: () => {
              console.log('Agree clicked');
            }
          }
        ]
      });
      alert.present();
    }
}
