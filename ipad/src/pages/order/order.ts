import { Component } from '@angular/core';
import { IonicPage, NavController, NavParams,AlertController,App } from 'ionic-angular';
import { StorageProvider } from '../../providers/storage/storage';
import {OrderInputPage} from '../order-input/order-input';
import {ManagerEntrancePage} from '../manager-entrance/manager-entrance';
import {TrashPage} from '../trash/trash';


/**
 * Generated class for the OrderPage page.
 *
 * See https://ionicframework.com/docs/components/#navigation for more info on
 * Ionic pages and navigation.
 */

@IonicPage()
@Component({
  selector: 'page-order',
  templateUrl: 'order.html',
})
export class OrderPage {


  constructor(public navCtrl: NavController, public navParams: NavParams,private app:App,
              public alertCtrl:AlertController,public storageProvider:StorageProvider) {
  }

  ionViewDidLoad() {
    console.log('ionViewDidLoad OrderPage '+JSON.stringify(this.storageProvider.orderList));
  }

  createNewOrder(){
        let order=this.storageProvider.configureOrderInput({});
        this.app.getRootNav().push(OrderInputPage,{order:order,menu: this.storageProvider.menus});
  }

    modifyOrder(input) {
        if(input.operation=="delete"){
             let alert = this.alertCtrl.create({
                    title: '주문을 삭제하시겠습니까?',
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
                                this.storageProvider.hideOrder(input.order.id);
                                return;
                            }
                            }]
                });
                alert.present();
        }else if(input.operation=="modify"){
                let order=this.storageProvider.configureOrderInput(input.order);
                this.app.getRootNav().push(OrderInputPage,{order:order,menu: this.storageProvider.menus});
        }
    };

  goManager(){
      this.app.getRootNavs()[0].push(ManagerEntrancePage);
  }

  goTrash(){
      this.app.getRootNavs()[0].push(TrashPage);
  }
}

