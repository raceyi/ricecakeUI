import { Component } from '@angular/core';
import { IonicPage, NavController, NavParams ,App} from 'ionic-angular';
import {CarrierManagementPage} from "../carrier-management/carrier-management";
import { StorageProvider } from '../../providers/storage/storage';
import {ManagerEntrancePage} from '../manager-entrance/manager-entrance';
import {TrashPage} from '../trash/trash';

/**
 * Generated class for the DeliveryPage page.
 *
 * See https://ionicframework.com/docs/components/#navigation for more info on
 * Ionic pages and navigation.
 */

@IonicPage()
@Component({
  selector: 'page-delivery',
  templateUrl: 'delivery.html',
})
export class DeliveryPage {

  constructor(public navCtrl: NavController,
              public navParams: NavParams,
              public app:App,
              public storageProvider:StorageProvider) {
  }

  ionViewDidLoad() {
    console.log('ionViewDidLoad DeliveryPage');
    this.storageProvider.reconfigureDeliverySection();
  }

  manageCarrier(){
            this.app.getRootNavs()[0].push(CarrierManagementPage);
  }

  goManager(){
      this.app.getRootNavs()[0].push(ManagerEntrancePage);
  }

  goTrash(){
      this.app.getRootNavs()[0].push(TrashPage);
  }

}
