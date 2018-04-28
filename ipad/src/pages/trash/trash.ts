import { Component } from '@angular/core';
import { IonicPage, NavController,AlertController, NavParams,Platform } from 'ionic-angular';
import {StorageProvider} from "../../providers/storage/storage";
import {ServerProvider} from "../../providers/server/server";
import {TrashPasswordPage} from '../trash-password/trash-password';
import { Events } from 'ionic-angular';

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
              public events: Events,
              public alertCtrl:AlertController,
              public platform:Platform,
              public serverProvider:ServerProvider,
              public storageProvider:StorageProvider) {

        events.subscribe('update', (tablename) => {
            console.log("TrashPage receive update event "+tablename);
            /*
            if(tablename=="order"){
                        let alert = this.alertCtrl.create({
                            title: '주문정보가 변경되었습니다.',
                            buttons: ['확인']
                        });
                        alert.present();      
            }*/
     });
  }

  ionViewDidLoad() {
    console.log('ionViewDidLoad TrashPage');
        this.platform.ready().then(() => {
            this.serverProvider.getOrdersInTrash().then((orders)=>{
                this.storageProvider.trashList=orders;
                this.storageProvider.trashList.sort(function(a,b){
                                if (a.id > b.id) return -1;
                                if (a.id < b.id) return 1;
                                return 0;
                });                
                this.storageProvider.convertOrderList(this.storageProvider.trashList);
            },err=>{

            })    
        });
  }

  ionViewWillUnload(){
    console.log("TrashPage- ionViewWillUnload");
    this.events.unsubscribe("update");
  }

  close(){
      this.navCtrl.pop();
  }

  recovery(order){
    this.storageProvider.showOrder(order.id);
  }

  callbackFunction = (pin) => {
     return new Promise((resolve, reject) => {
        console.log("callbackFunction:"+pin);
        //check pin number here to make trash empty
        //ask check if pin is valid or not.

        this.serverProvider.checkPIN(pin).then(()=>{
              this.storageProvider.deleteOrders().then(()=>{
                  resolve();
              },err=>{
                    let alert = this.alertCtrl.create({
                        title: '휴지통 비우기에 실패했습니다.',
                        subTitle:err,
                        buttons: ['확인']
                    });
                    alert.present();
                    resolve();
              })
          },err=>{
                if(typeof err==="string" && err.indexOf("invalidPIN")>=0){
                    let alert = this.alertCtrl.create({
                        title: '비밀번호가 일치하지 않습니다.',
                        buttons: ['확인']
                    });
                    alert.present();
                    resolve();
                }else if(typeof err==="string" ){
                    let alert = this.alertCtrl.create({
                        title: '관리자 비밀번호 확인에 실패했습니다.',
                        subTitle:err,
                        buttons: ['확인']
                    });
                    alert.present();
                    resolve();
                }
          });
     });
  }

  removeAll(){
      let alert = this.alertCtrl.create({
        title: '휴지통을 정말 비우시겠습니까?',
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
                    //this.storageProvider.deleteOrders();
                    return;
                  }
                }]
      });
      alert.present();

  }
}
