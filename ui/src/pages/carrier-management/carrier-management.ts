import { Component } from '@angular/core';
import { IonicPage, NavController,AlertController, NavParams } from 'ionic-angular';
import {StorageProvider} from "../../providers/storage/storage";

/**
 * Generated class for the CarrierManagementPage page.
 *
 * See https://ionicframework.com/docs/components/#navigation for more info on
 * Ionic pages and navigation.
 */

@IonicPage()
@Component({
  selector: 'page-carrier-management',
  templateUrl: 'carrier-management.html',
})
export class CarrierManagementPage {

  constructor(public navCtrl: NavController, 
              public navParams: NavParams,
              public alertCtrl:AlertController,
              public storageProvider:StorageProvider) {
  }

  ionViewDidLoad() {
    console.log('ionViewDidLoad CarrierManagementPage');
  }

  close(){
    this.navCtrl.pop();
  }

  removeCarrier(name){
      let alert = this.alertCtrl.create({
        title: name+'님을 삭제하시겠습니까?',
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
                    return;
                  }
                }]
      });
      alert.present();
  }

  addCarrier(){
    
  }
}
