import { Component } from '@angular/core';

import { IonicPage, NavController, NavParams } from 'ionic-angular';
import { App } from 'ionic-angular';

import * as moment from 'moment';

import {DuckMainPage} from '../duck-main/duck-main';
import {GarbagePage} from '../garbage/garbage';

@IonicPage()
@Component({
  selector: 'page-administrator',
  templateUrl: 'administrator.html',
})
export class AdministratorPage {
  currentPage='GarbagePage';

  myDate:string;

  constructor(private app:App, public navCtrl: NavController, public navParams: NavParams) {

   
    var d = new Date();
    var mm = d.getMonth() < 9 ? "0" +(d.getMonth() + 1) : (d.getMonth() + 1); //getMonth()
    var dd = d.getDate() < 10 ? "0" + d.getDate() : d.getDate();
    var hh = d.getHours() < 10? "0" + d.getHours() : d.getHours();
    var min = d.getMinutes() < 10? "0" + d.getMinutes():d.getMinutes();
    var dString=d.getFullYear()+'-'+(mm)+'-'+dd+'T'+hh+":"+min+moment().format("Z");
    
    //var dString=d.toISOString(); //UTC time
    this.myDate=dString; 


  }

  ionViewDidLoad() {
    console.log('ionViewDidLoad AdministratorPage');
  }
  
  openDuckMainPage(){
    console.log("openDuckmainPage");
    this.app.getRootNavs()[0].setRoot(DuckMainPage);
    setTimeout(()=> { this.currentPage='AdministratorPage';}, 500);
    }

  openGarbagePage(){
    console.log("openGarbagePage");
    this.app.getRootNavs()[0].setRoot(GarbagePage);
    setTimeout(() => { this.currentPage='GarbagePage';}, 500);
    }
  checkInput(){
    console.log(this.myDate);
    var date=new Date(this.myDate);
    console.log("month"+date.getMonth()+"date:"+date.getDate()+"hour"+date.getHours());
  }
}
