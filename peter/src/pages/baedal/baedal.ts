import { Component } from '@angular/core';
import { IonicPage, NavController, NavParams } from 'ionic-angular';
import { App } from 'ionic-angular';
import { DuckMainPage } from '../duck-main/duck-main';
/**
 * Generated class for the BaedalPage page.
 *
 * See https://ionicframework.com/docs/components/#navigation for more info on
 * Ionic pages and navigation.
 */

@IonicPage()
@Component({
  selector: 'page-baedal',
  templateUrl: 'baedal.html',
})
export class BaedalPage {
  currentPage='DuckMainPage';

  constructor(public app:App, public navCtrl: NavController, public navParams: NavParams) {
  }

  ionViewDidLoad() {
    console.log('ionViewDidLoad BaedalPage');
   }
   openDuckMainPage(){
    console.log("openDuckMainPage");
    this.app.getRootNavs()[0].setRoot(DuckMainPage);
    setTimeout(()=> { this.currentPage='DuckMainPage';}, 500);
    }
    
}
