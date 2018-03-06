import { Component } from '@angular/core';
import { NavController } from 'ionic-angular';
import * as moment from 'moment';

@Component({
  selector: 'page-home',
  templateUrl: 'home.html'
})
export class HomePage {
  
  displayDate;

  orderItems;
  myDate:string;
  myDateYesterday: string;
  myDateTomorrow: string;
 
  constructor(public navCtrl: NavController) {
      this.initializeItems();
      var d = new Date();
      var mm = d.getMonth() < 9? "0" + (d.getMonth() + 1) : (d.getMonth() +1);
      var dd = d.getDate() <10? "0" + d.getDate() : d.getDate();
//      var dddd = d.getDay();
      var ddYesterday = d.getDate()-1 <10? "0" + d.getDate() : d.getDate();
      var ddTomorrow = d.getDate()+1 <10? "0" + d.getDate() : d.getDate();
      var hh = d.getHours() <10? "0" + d.getHours() : d.getHours();
      var min = d.getMinutes() <10? "0"+d.getMinutes() : d.getMinutes();
      
      var dString = d.getFullYear()+ '-' + (mm) + '-' + (dd) + 'T' + hh + ":" + min+ moment().format("Z");
      var dStringYesterday = d.getFullYear()+ '-' + (mm) + '-' + (ddYesterday) + 'T' + hh + ":" + min+ moment().format("Z");
      var dStringTomorrow = d.getFullYear()+ '-' + (mm) + '-' + (ddTomorrow) + 'T' + hh + ":" + min+ moment().format("Z");
  
      this.myDate = dString;
      
      this.myDateYesterday = dStringYesterday;
      this.myDateTomorrow = dStringTomorrow;

      let now=new Date();
      this.displayDate={ milliseconds:now.getTime() ,ios8601:dString};
  }


  getISOtime(time){  // milliseconds
    let d=new Date();
    d.setTime(time);
    var mm = d.getMonth() < 9? "0" + (d.getMonth() + 1) : (d.getMonth() +1);
    var dd = d.getDate() <10? "0" + d.getDate() : d.getDate();
    var ddYesterday = d.getDate()-1 <10? "0" + d.getDate() : d.getDate();
    var ddTomorrow = d.getDate()+1 <10? "0" + d.getDate() : d.getDate();
    var hh = d.getHours() <10? "0" + d.getHours() : d.getHours();
    var min = d.getMinutes() <10? "0"+d.getMinutes() : d.getMinutes();
    
    var dString = d.getFullYear()+ '-' + (mm) + '-' + (dd) + 'T' + hh + ":" + min+ moment().format("Z");
    return dString;
  }

  goYeterday(){  
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

  getOrderItems(ev){
    // Reset items back to all of the items;
    this.initializeItems();

    //set val to the value of the ev target
    var val = ev.target.value;

    //if the value is an empty string don't filter the items
    if(val && val.trim() != '')
    {
      this.orderItems = this.orderItems.filter((item) =>
      {
        return (item.toLowerCase().indexOf(val.toLowerCase()) > -1);
      })
    }

  }

  ionViewDidLoad() {
    console.log('ionViewDidLoad Page3Page');
  }

  orderButtonColor="#508AE4";
  deliverButtonColor="#e1e1e1";
  produceButtonColor="#e1e1e1";

  orderButtonFlag:boolean=false;
  deliverButtonFlag:boolean=true;
  produceButtonFlag:boolean=true;
  
  orderButton(){
    this.orderButtonColor="#508AE4";
    this.deliverButtonColor="#e1e1e1";
    this.produceButtonColor="#e1e1e1";

    this.deliverButtonFlag=true;
    this.produceButtonFlag=true;
    this.orderButtonFlag=false;
  }

  deliverButton(){
    this.deliverButtonColor="#508AE4";
    this.orderButtonColor="#e1e1e1";
    this.produceButtonColor="#e1e1e1";

    this.orderButtonFlag=true;
    this.produceButtonFlag=true;
    this.deliverButtonFlag=false;

    
  }

  produceButton(){
    this.produceButtonColor="#508AE4";
    this.orderButtonColor="#e1e1e1";
    this.deliverButtonColor="#e1e1e1";

    this.orderButtonFlag=true;
    this.deliverButtonFlag=true;
    this.produceButtonFlag=false;
  }

  

  goYesterday(){
    var dateYesterday = new Date(this.myDateYesterday);
  }

 // goTomorrow(){
 //   var dateTomorrow = new Date(this.myDateTomorrow);
 // }

  /*checkInput(){
    console.log(this.myDate);
    var date=new Date(this.myDate);
    console.log("month: "+date.getMonth()+ "  date: "+date.getDate()+"  hour: "+date.getHours())
  }*/

}
