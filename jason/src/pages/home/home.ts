import { Component } from '@angular/core';
import { NavController } from 'ionic-angular';
import * as moment from 'moment';

@Component({
  selector: 'page-home',
  templateUrl: 'home.html'
})
export class HomePage {
  displayDate;
  //member variables//
  orderItems;
  myDate: string;
  myHMTime: string;

  deliverTime: string;
  recipientAddress: string;
  buyerName: string;
  recipientName: string;
  recipientPhoneNumber: string;
  buyerPhoneNumber: string;
  dduckName: string;
  dduckAmount: string;
  dduckUnit: string;
  memo: string;
  price: string;
  paymentOptions: string;
  paymentPlan: string;

  //ngFor variables//
  orderList=[];
  dduckAddedList=[];



  constructor(public navCtrl: NavController) {
      this.initializeItems();
      var d = new Date();
      var mm = d.getMonth() < 9? "0" + (d.getMonth() + 1) : (d.getMonth() +1);
      var dd = d.getDate() <10? "0" + d.getDate() : d.getDate();
//    var dddd = d.getDay();
      var hh = d.getHours() <10? "0" + d.getHours() : d.getHours();
      var min = d.getMinutes() <10? "0"+d.getMinutes() : d.getMinutes();  
      var dString = d.getFullYear()+ '-' + (mm) + '-' + (dd) + 'T' + hh + ":" + min+ moment().format("Z");
      var hmString = hh + ":" + min + moment().format("Z");
      //     this.myDate = dString;
      this.myHMTime=hmString;
      let now=new Date();
      this.displayDate={ milliseconds:now.getTime() ,ios8601:dString};
  }

  getISOtime(time){  // milliseconds
    let d=new Date();
    d.setTime(time);
    var mm = d.getMonth() < 9? "0" + (d.getMonth() + 1) : (d.getMonth() +1);
    var dd = d.getDate() <10? "0" + d.getDate() : d.getDate();
    var hh = d.getHours() <10? "0" + d.getHours() : d.getHours();
    var min = d.getMinutes() <10? "0"+d.getMinutes() : d.getMinutes();
    var dString = d.getFullYear()+ '-' + (mm) + '-' + (dd) + 'T' + hh + ":" + min+ moment().format("Z");
    return dString;
  }

  goYesterday(){  
    this.displayDate.milliseconds=this.displayDate.milliseconds-24*60*60*1000;
    console.log("yesterday:"+this.getISOtime(this.displayDate.milliseconds));
    this.displayDate.ios8601=this.getISOtime(this.displayDate.milliseconds);
  }

  goTomorrow(){
    this.displayDate.milliseconds=this.displayDate.milliseconds+24*60*60*1000;
    console.log("yesterday:"+this.getISOtime(this.displayDate.milliseconds));
    this.displayDate.ios8601=this.getISOtime(this.displayDate.milliseconds);   
  }

  initializeItems(){

    this.orderItems = [
      'Seoul',
      'Hong Kong',
      'London',
      'Madrid',
      'Los Angelos',
      'New York',
      'Tokyo'
    ];
  }

  getOrderItems(ev) {
    // Reset items back to all of the items;
    this.initializeItems();

    //set val to the value of the ev target
    var val = ev.target.value;

    //if the value is an empty string don't filter the items
    if (val && val.trim() != '') {
      this.orderItems = this.orderItems.filter((item) => {
        return (item.toLowerCase().indexOf(val.toLowerCase()) > -1);
      })
    }

  }

  ionViewDidLoad() {
    console.log('ionViewDidLoad Page3Page');
  }

  orderButtonColor = "#508AE4";
  deliverButtonColor = "#e1e1e1";
  produceButtonColor = "#e1e1e1";

  orderButtonFlag: boolean = false;
  deliverButtonFlag: boolean = true;
  produceButtonFlag: boolean = true;

  orderButton() {
    this.orderButtonColor = "#508AE4";
    this.deliverButtonColor = "#e1e1e1";
    this.produceButtonColor = "#e1e1e1";

    this.deliverButtonFlag = true;
    this.produceButtonFlag = true;
    this.orderButtonFlag = false;
  }

  deliverButton() {
    this.deliverButtonColor = "#508AE4";
    this.orderButtonColor = "#e1e1e1";
    this.produceButtonColor = "#e1e1e1";

    this.orderButtonFlag = true;
    this.produceButtonFlag = true;
    this.deliverButtonFlag = false;


  }

  produceButton() {
    this.produceButtonColor = "#508AE4";
    this.orderButtonColor = "#e1e1e1";
    this.deliverButtonColor = "#e1e1e1";

    this.orderButtonFlag = true;
    this.deliverButtonFlag = true;
    this.produceButtonFlag = false;
  }
  /*checkInput(){
    console.log(this.myDate);
    var date=new Date(this.myDate);
    console.log("month: "+date.getMonth()+ "  date: "+date.getDate()+"  hour: "+date.getHours())
  }*/


  save(){
    let order={deliverTime: this.deliverTime, recipientAddress: this.recipientAddress, recipientName: this.recipientName
    , recipientPhoneNumber: this.recipientPhoneNumber, buyerName: this.buyerName, buyerPhoneNumber: this.buyerPhoneNumber
    , dduckAddedList: this.dduckAddedList, memo: this.memo, price: this.price, paymentOptions: this.paymentOptions, paymentPlan: this.paymentPlan}
      
    this.orderList.push(order);
    console.log("orderList:"+JSON.stringify(this.orderList));
    
    this.deliverTime="";
    this.recipientAddress="";
    this.recipientName="";
    this.recipientPhoneNumber="";
    this.buyerName="";
    this.buyerPhoneNumber="";
    this.dduckAddedList=
    this.dduckAddedList=[];
    this.memo="";
    this.price="";
    this.paymentOptions="";
    this.paymentPlan="";
  }

  dduckAdd(){
    let dduckAdded={dduckName: this.dduckName, dduckAmount:this.dduckAmount, dduckUnit: this.dduckUnit}
    this.dduckAddedList.push(dduckAdded);
    this.dduckName="";
    this.dduckAmount="";
    this.dduckUnit="";
  }  


}
