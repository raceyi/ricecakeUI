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

  newCarrier;

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
                    this.storageProvider.deleteCarrier(name).then(()=>{
                        console.log("deleteCarrier success ");
                    },(err:any)=>{
                      if(typeof err==="string" && err.indexOf("AlreadyDeleted")>=0){
                            let alert = this.alertCtrl.create({
                                title: '이미 삭제된 배달원입니다.',
                                buttons: ['확인']
                            });
                            alert.present();
                          }
                  });
                  }
                }]
      });
      alert.present();
  }

  addCarrier(){
    if(this.newCarrier ==undefined || this.newCarrier.trim().length==0){
                            let alert = this.alertCtrl.create({
                                title: '이름을 입력해 주시기 바랍니다.',
                                buttons: ['확인']
                            });
                            alert.present();

    }

    this.storageProvider.addCarrier(this.newCarrier).then(()=>{
          this.newCarrier="";
      },(err)=>{
          if(typeof err==="string" && err.indexOf("AlreadyExist")>=0){
                let alert = this.alertCtrl.create({
                    title: '이미 추가된 배달원입니다.',
                    buttons: ['확인']
                });
                alert.present();
                this.newCarrier="";
          }else{
                let alert = this.alertCtrl.create({
                    title: '배달원 추가에 실패했습니다.',
                    subTitle:err,
                    buttons: ['확인']
                });
                alert.present();            
          }
    });
  }
}
