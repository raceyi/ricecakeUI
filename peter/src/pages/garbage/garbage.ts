import { Component } from '@angular/core';
import { IonicPage, NavController, NavParams } from 'ionic-angular';
import { App } from 'ionic-angular';
import {DuckMainPage} from '../duck-main/duck-main';
import {AdministratorPage} from '../administrator/administrator';

@IonicPage()
@Component({
  selector: 'page-garbage',
  templateUrl: 'garbage.html',
})

export class GarbagePage {
  currentPage='DuckMainPage';
  constructor(private app:App, public navCtrl: NavController, public navParams: NavParams) {
  }

  ionViewDidLoad() {
    console.log('ionViewDidLoad GarbagePage');
  }
  
  openDuckMainPage(){
    console.log("openDuckMainPage");
    this.app.getRootNavs()[0].setRoot(DuckMainPage);
    setTimeout(()=> { this.currentPage='DuckMainPage';}, 500);
    }
    
  openAdministratorPage(){
    console.log("AdministratorPage");
    this.app.getRootNavs()[0].setRoot(AdministratorPage);
    setTimeout(() => { this.currentPage='AdministratorPage';}, 500);
    }

}
