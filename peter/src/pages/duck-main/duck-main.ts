import { Component } from '@angular/core';

import { Platform,IonicPage, NavController, NavParams } from 'ionic-angular';

import * as moment from 'moment';

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
  isAndroid:boolean=false;

  myDate:string;
  DeliveryDate:string;
  
  orderList=[];

  constructor(platform: Platform, private app: App,public navCtrl: NavController, public navParams: NavParams) {
   this.isAndroid = platform.is('android');
  
   /*this.initializeItems();
   */

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
  
  /*initializeItems(){
    this.orderItems = [
      '주문목록1',
      '주문목록2',
      '주문목록3'
    ];
  }*/
  
  /*getOrderItems(ev){
    this.initializeItems();

    var val =ev.target.value;

    if(val && val.trim() !='')
    {
      this.orderItems = this.orderItems.filter((item)=>
      {
        return (item.toLowerCase().indexOf(val.toLowerCase()) > -1);
      })
    }
  }*/

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
    
  save(){
    
    let order={deliveryDue: this.DeliveryDate ,address: "address" ,recipientName: "recipientName",recipientTel: "recipientTel",buyerName:"buyerName", buyerTel:"buyerTel" ,
     menus:[{menuName:"menuName", menuAmount:"menuAmount",menuUnit:"menuUnit" }], amount:"amount" , paymentType: "paymentType", paymentStatus:"paymentStatus" , memo:"memo", delivery:"delivery"};
    this.orderList.push(order);
  }
}
