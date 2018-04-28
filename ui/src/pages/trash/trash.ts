import { Component } from '@angular/core';
import { IonicPage, NavController,AlertController, NavParams } from 'ionic-angular';
import {StorageProvider} from "../../providers/storage/storage";
import {TrashPasswordPage} from '../trash-password/trash-password';

/**
 * Generated class for the TrashPage page.
 *
 * See https://ionicframework.com/docs/components/#navigation for more info on
 * Ionic pages and navigation.
 */

@IonicPage()
@Component({
  selector: 'page-trash',
  templateUrl: 'trash.html',
})
export class TrashPage {

  constructor(public navCtrl: NavController, public navParams: NavParams,
              public alertCtrl:AlertController,public storageProvider:StorageProvider) {
  }

  ionViewDidLoad() {
    console.log('ionViewDidLoad TrashPage');
  }

  close(){
      this.navCtrl.pop();
  }

  recovery(order){

  }

  callbackFunction = (pin) => {
     return new Promise((resolve, reject) => {
        console.log("callbackFunction:"+pin);
        //check pin number here to make trash empty
        //ask check if pin is valid or not.
        resolve();
     });
  }

  removeAll(){
      let alert = this.alertCtrl.create({
        title: '휴지통을 비우시겠습니까?',
        buttons: [
                {
                  text: '아니오',
                  handler: () => {
                    return;
                  }
                },
                {
                  text: '네',
                  handler: () => {
                    console.log('agree clicked');
                    this.navCtrl.push(TrashPasswordPage,{callback:this.callbackFunction});
                    return;
                  }
                }]
      });
      alert.present();

  }
}
