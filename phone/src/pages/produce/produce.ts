import { Component } from '@angular/core';
import { IonicPage, NavController, NavParams ,App} from 'ionic-angular';
import {ManagerEntrancePage} from '../manager-entrance/manager-entrance';
import {TrashPage} from '../trash/trash';
import { StorageProvider } from '../../providers/storage/storage';

/**
 * Generated class for the ProducePage page.
 *
 * See https://ionicframework.com/docs/components/#navigation for more info on
 * Ionic pages and navigation.
 */

@IonicPage()
@Component({
  selector: 'page-produce',
  templateUrl: 'produce.html',
})
export class ProducePage {

  constructor(public navCtrl: NavController, public navParams: NavParams,public app:App,
              public storageProvider:StorageProvider) {
  }

  ionViewDidLoad() {
    console.log('ionViewDidLoad ProducePage');
  }

topRowStyles = {
    'border-style':'solid',
    'border-width':'1px',
    'border-color': 'darkgray'
  };

  otherRowStyles = {
    'border-left-style':'solid',
    'border-left-width':'1px',
    'border-left-color': 'darkgray',
    'border-right-style':'solid',
    'border-right-width':'1px',
    'border-right-color': 'darkgray',
    'border-bottom-style':'solid',
    'border-bottom-width':'1px',
    'border-bottom-color': 'darkgray'
  };

    rowStyles(k){
        if(k==0){
            return this.topRowStyles;
        }else
            return this.otherRowStyles;
    }

  goManager(){
      this.app.getRootNavs()[0].push(ManagerEntrancePage);
  }

  goTrash(){
      this.app.getRootNavs()[0].push(TrashPage);
  }
}
