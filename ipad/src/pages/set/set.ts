import { Component } from '@angular/core';
import { IonicPage, NavController, NavParams ,App} from 'ionic-angular';
import { StorageProvider } from '../../providers/storage/storage';
import {ManagerEntrancePage} from '../manager-entrance/manager-entrance';
import {TrashPage} from '../trash/trash';


/**
 * Generated class for the SetPage page.
 *
 * See https://ionicframework.com/docs/components/#navigation for more info on
 * Ionic pages and navigation.
 */

@IonicPage()
@Component({
  selector: 'page-set',
  templateUrl: 'set.html',
})
export class SetPage {

  constructor(public navCtrl: NavController, public navParams: NavParams,
               public storageProvider:StorageProvider,public app:App) {
  }

  ionViewDidLoad() {
    console.log('ionViewDidLoad SetPage');
  }

  goManager(){
      this.app.getRootNavs()[0].push(ManagerEntrancePage);
  }

  goTrash(){
      this.app.getRootNavs()[0].push(TrashPage);
  }
}
