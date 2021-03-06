import { Component } from '@angular/core';

import { Platform,IonicPage, NavController, NavParams } from 'ionic-angular';

import * as moment from 'moment';

import {AppDataProvider} from '../../providers/app-data/app-data';

import {AdministratorPage} from '../administrator/administrator';
import {GarbagePage} from '../garbage/garbage';
import {BaedalPage} from '../baedal/baedal';
import { App } from 'ionic-angular';

@IonicPage()

@Component({
  selector: 'page-duck-main',
  templateUrl: 'duck-main.html',
})
export class DuckMainPage {
  
  //orderItems;

  currentPage='AministratorPage';

  duck:string = "order";
  //segment 나눌 때
  isAndroid:boolean=false;

  myDate:string;
  DeliveryDate:string;
  address:string;
  recipientName:string;
  recipientTel:string;
  buyerName:string;
  buyerTel:string;
  menuName:string;
  menuAmount:string;
  amount:string;
  paymentStatus:string;
  memo:string;
  menuUnit:string;
  deliveryman:string;
  paymentType:string;

  orderList=[];
  menus=[];

  constructor(platform: Platform, private app: App,public navCtrl: NavController, public navParams: NavParams, public appDataProvider:AppDataProvider) {
   this.isAndroid = platform.is('android');
  
   /*this.initializeItems();*/

   var d = new Date();
   var mm = d.getMonth() < 9 ? "0" +(d.getMonth() + 1) : (d.getMonth() + 1); //getMonth()
   var dd = d.getDate() < 10 ? "0" + d.getDate() : d.getDate();
   var hh = d.getHours() < 10? "0" + d.getHours() : d.getHours();
   var min = d.getMinutes() < 10? "0" + d.getMinutes():d.getMinutes();
   var dString=d.getFullYear()+'-'+(mm)+'-'+dd+'T'+hh+":"+min+moment().format("Z");
   
   //var dString=d.toISOString(); //UTC time
   this.myDate=dString;
   this.DeliveryDate=dString;
  }
  
  openAdministratorPage(){
    console.log("openAdministratorPage");
    this.app.getRootNavs()[0].setRoot(AdministratorPage);
    setTimeout(()=> { this.currentPage='AdministratorPage';}, 500);
    }

  openGarbagePage(){
    console.log("openGarbagePage");
    this.app.getRootNavs()[0].setRoot(GarbagePage);
    setTimeout(() => { this.currentPage='GarbagePage';}, 500);
    }
  openBaedalPage(){
    console.log("BaedalPage");
      this.app.getRootNavs()[0].setRoot(BaedalPage);
      setTimeout(() => { this.currentPage='BaedalPage';}, 500);
      }
  checkInput(){
    console.log(this.myDate);
    var date=new Date(this.myDate);
    console.log("month"+date.getMonth()+"date:"+date.getDate()+"hour"+date.getHours());
  }
  checkInput1(){
    console.log(this.myDate);
    var date=new Date(this.myDate);
    console.log("month"+date.getMonth()+"date:"+date.getDate()+"hour"+date.getHours());
  }        
    
 save(){
    let order={deliveryDue: this.DeliveryDate ,address: this.address ,recipientName: this.recipientName ,recipientTel: this.recipientTel, buyerName: this.buyerName, buyerTel: this.buyerTel ,
    menus: this.menus , amount: this.amount , paymentType: this.paymentType, paymentStatus: this.paymentStatus , memo: this.memo, deliveryman: this.deliveryman};
    this.orderList.push(order);
    console.log(JSON.stringify(this.orderList)) 
    this.menus=[];
  } 

  savemenu(){
    let menu={menuName:this.menuName, menuAmount: this.menuAmount, menuUnit: this.menuUnit}
    this.menus.push(menu);
  }  
}

