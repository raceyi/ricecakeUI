import { Component } from '@angular/core';
import { IonicPage, NavController,AlertController, NavParams } from 'ionic-angular';
import {StorageProvider} from "../../providers/storage/storage";
import {ServerProvider} from "../../providers/server/server";

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
              public serverProvider:ServerProvider,
              public storageProvider:StorageProvider) {

        events.subscribe('update', (tablename) => {
            console.log("TrashPage receive update event");
            this.serverProvider.getOrdersInTrash().then((orders)=>{
                this.storageProvider.trashList=orders;
                this.storageProvider.convertOrderList(this.storageProvider.trashList);
            },err=>{

            })
        });

  }

  ionViewDidLoad() {
    console.log('ionViewDidLoad TrashPage');
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
                    this.storageProvider.deleteOrders();
                    return;
                  }
                }]
      });
      alert.present();

  }
}
