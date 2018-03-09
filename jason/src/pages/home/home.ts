import { Component ,NgZone} from '@angular/core';
import { NavController, App } from 'ionic-angular';
import * as moment from 'moment';
import { InAppBrowser } from '@ionic-native/in-app-browser'
import { Printer, PrintOptions } from '@ionic-native/printer'
import { Platform } from 'ionic-angular/platform/platform';
import { AlertController } from 'ionic-angular/components/alert/alert-controller';
import { Page2Page } from '../page2/page2';
import { Page3Page } from '../page3/page3';


var gPage;

@Component({
  selector: 'page-home',
  templateUrl: 'home.html'
})
export class HomePage {
  currentPage: Page2Page;
  
  displayDate;
  //member variables//
  orderItems;
  myDate: string;
  myHMTime: string;

  deliverTime: string;
  recipientAddress: string="도로명 주소 선택";
  recipientAddressDetail: string;
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
  advancedPayment: string;

  //ngFor variables//
  orderList=[];
  dduckAddedList=[];

  //get address variable
  display:string="order";

  browserRef;
  done:boolean=false;
  redirectUrl="http://www.takit.biz";


  constructor(
    private platform: Platform,
    public alertCtrl:AlertController, 
    public navCtrl: NavController,
    private iab: InAppBrowser,
    private ngZone:NgZone,
    private printer: Printer,
    private app: App){
      
      platform.ready().then(() => {
        console.log("Platform ready comes at homePage");

        this.printer.isAvailable().then((avail)=>{
            console.log("avail:"+avail);
            this.printer.check().then((output)=>{
              console.log("output:"+JSON.stringify(output));
            },err=>{

            });
        }, (err)=>{
            console.log("err:"+JSON.stringify(err));
        });
  });
   gPage=this;

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

  adminPage(){
    console.log("open administarator page");
    this.app.getRootNavs[0].setRoot(Page2Page);
    //setTimeout(()=>{this.currentPage= Page2Page;}, 500);
  }

  trashPage(){
    console.log("open trash page");
    this.app.getRootNavs[0].setRoot(Page3Page);
    //setTimeout(() => {this.currentPage='Page3Page';}, 500);
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


//////////////////////////        BUTTON FLAG       ////////////////////////////////
  orderButtonColor = "#508AE4";
  deliverButtonColor = "#e1e1e1";
  produceButtonColor = "#e1e1e1";

  orderButtonFlag: boolean = false;
  deliverButtonFlag: boolean = true;
  produceButtonFlag: boolean = true;




//////////////////////////        ORDER SECTION       ////////////////////////////////  
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
    let order={deliverTime: this.deliverTime, recipientAddress: this.recipientAddress, recipientAddressDetail: this.recipientAddressDetail, recipientName: this.recipientName
    , recipientPhoneNumber: this.recipientPhoneNumber, buyerName: this.buyerName, buyerPhoneNumber: this.buyerPhoneNumber
    , dduckAddedList: this.dduckAddedList, memo: this.memo, price: this.price, paymentOptions: this.paymentOptions, paymentPlan: this.paymentPlan, advancedPayment: this.advancedPayment}
      
    this.orderList.push(order);
    console.log("orderList:"+JSON.stringify(this.orderList));
    
    this.deliverTime="";
    this.recipientAddress="";
    this.recipientAddressDetail="";
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
    this.advancedPayment="";
  }

  dduckAdd(){
    let dduckAdded={dduckName: this.dduckName, dduckAmount:this.dduckAmount, dduckUnit: this.dduckUnit}
    this.dduckAddedList.push(dduckAdded);
    this.dduckName="";
    this.dduckAmount="";
    this.dduckUnit="";
  }  

  print(){
    
    var page = '<h1>Hello Document</h1>';

     
    let options: PrintOptions = {
        name: 'MyDocument',
        printerId: 'printer007',
        duplex: true,
        landscape: true,
        grayscale: true
      };

    this.printer.print(page, options).then((output)=>{
        console.log("print-output:"+JSON.stringify(output));
    },(err)=>{
        console.log("err:"+JSON.stringify(err));
    });
  }

  getJuso(){

    let localfile;
    if(this.platform.is('android')){
        console.log("android");
        localfile='file:///android_asset/www/assets/address.up.html';
    }else if(this.platform.is('ios')){
        console.log("ios");
        localfile='assets/address.up.html';
        //localfile='assets/address.html';
    }
        this.browserRef=this.iab.create(localfile,"_blank" ,'toolbarposition=top,location=no,presentationstyle=formsheet,closebuttoncaption=종료');

        this.browserRef.on("loadstart").subscribe((e) =>{
          if (e.url.startsWith(this.redirectUrl)) {
            let url=decodeURI(e.url);
            let address=url.substring(this.redirectUrl.length+1);
            this.ngZone.run(()=>{
              this.recipientAddress=address;
            });
            console.log("address:"+decodeURI(address));
              gPage.done=true;            
              gPage.browserRef.close();
          }
        });

        this.browserRef.on("exit").subscribe( (e) => {
        });

  }
}
