import { Component } from '@angular/core';
import { IonicPage, NavController, NavParams } from 'ionic-angular';

/**
 * Generated class for the DuckMainPage page.
 *
 * See https://ionicframework.com/docs/components/#navigation for more info on
 * Ionic pages and navigation.
 */

@IonicPage()
@Component({
  selector: 'page-duck-main',
  templateUrl: 'duck-main.html',
})
export class DuckMainPage {
  myValue:Boolean=false;
  
   order = false;
   delivery = false;
   production = false;
  constructor(public navCtrl: NavController, public navParams: NavParams) {
  }

  ionViewDidLoad() {
    console.log('ionViewDidLoad DuckMainPage');
  }
  orderOpen() {
    this.order = true;
  }
  deliveryOpen() {
    this.delivery = true;
  }
  productionOpen() {
    this.production = true;
  }


}
