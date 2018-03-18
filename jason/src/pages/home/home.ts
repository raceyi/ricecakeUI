import { Component ,NgZone} from '@angular/core';
import { NavController, App } from 'ionic-angular';
import * as moment from 'moment';
import { InAppBrowser } from '@ionic-native/in-app-browser'
import { Printer, PrintOptions } from '@ionic-native/printer'
import { Platform } from 'ionic-angular/platform/platform';
import { AlertController } from 'ionic-angular/components/alert/alert-controller';
import { Page2Page } from '../page2/page2';
import { Page3Page } from '../page3/page3';
import { HttpHeaders, HttpClient } from '@angular/common/http';


var gPage;

@Component({
  selector: 'page-home',
  templateUrl: 'home.html'
})
export class HomePage {
  currentPage: Page2Page;
  
  displayOrderDate;
  displayDeliverDate;
  //member variables//
  orderItems;
  myDate: string;
//  myHMTime: string;

  deliverTime: string;
  recipientAddress: string="도로명 주소 선택";
  recipientAddressDetail: string;
  buyerName: string;
  recipientName: string;
  recipientPhoneNumber: string;
  buyerPhoneNumber: string;
  dduckName: string;
  dduckAmount: number;
  dduckUnit: string;
  memo: string;
  price: number=null;
  paymentOptions: string;
  paymentPlan: string;
  advancedPayment: number;
  balancePayment: number=this.price-this.advancedPayment;


  //deliver section variables
  deliveryMan: string;
  deliveryManList=["조인성", "김태희", "장동건", "한가인", "정우성", "수지", "원빈", "한효주", "강동원", "정유미"];




  //ngFor variables//
  orderList=[];
  dduckAddedList=[];

  //get address variable
  display: string="order";

  browserRef;
  done:boolean=false;
  redirectUrl="http://www.takit.biz";


  constructor(
    private http: HttpClient,
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
      var hmString = hh + ":" + min;
      //     this.myDate = dString;
      this.deliverTime = hmString;
      console.log("deliverTime: "+this.deliverTime);
      let now=new Date();
      this.displayOrderDate={milliseconds:now.getTime() ,ios8601:dString};
      this.displayDeliverDate={milliseconds:now.getTime(), ios8601:dString};
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

  orderGoYesterday(){  
    this.displayOrderDate.milliseconds=this.displayOrderDate.milliseconds-24*60*60*1000;
    console.log("order tab yesterday:"+this.getISOtime(this.displayOrderDate.milliseconds));
    this.displayOrderDate.ios8601=this.getISOtime(this.displayOrderDate.milliseconds);
  }

  orderGoTomorrow(){
    this.displayOrderDate.milliseconds=this.displayOrderDate.milliseconds+24*60*60*1000;
    console.log("order tab yesterday:"+this.getISOtime(this.displayOrderDate.milliseconds));
    this.displayOrderDate.ios8601=this.getISOtime(this.displayOrderDate.milliseconds);   
  }

  deliverGoYesterday(){
    this.displayDeliverDate.milliseconds=this.displayDeliverDate.milliseconds-24*60*60*1000;
    console.log("deliver tab yesterday:"+this.getISOtime(this.displayDeliverDate.milliseconds));
    this.displayDeliverDate.ios8601=this.getISOtime(this.displayDeliverDate.milliseconds);
  }

  deliverGoTomorrow(){
    this.displayDeliverDate.milliseconds=this.displayDeliverDate.milliseconds+24*60*60*1000;
    console.log("deliver tab tomorrow:"+this.getISOtime(this.displayDeliverDate.milliseconds));
    this.displayDeliverDate.ios8601=this.getISOtime(this.displayDeliverDate.milliseconds);
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
    let order={deliverTime: this.deliverTime, recipientAddress: this.recipientAddress, 
      recipientAddressDetail: this.recipientAddressDetail, recipientName: this.recipientName, 
      recipientPhoneNumber: this.recipientPhoneNumber, buyerName: this.buyerName, 
      buyerPhoneNumber: this.buyerPhoneNumber, dduckAddedList: this.dduckAddedList, 
      memo: this.memo, price: this.price, paymentOptions: this.paymentOptions, 
      paymentPlan: this.paymentPlan, advancedPayment: this.advancedPayment, balancePayment:this.price-this.advancedPayment}
      
    this.orderList.push(order);
    console.log("orderList:"+JSON.stringify(this.orderList));
    
    //Initialize
    this.deliverTime=this.deliverTime;
   /* this.recipientAddress="도로명 주소 선택";
    this.recipientAddressDetail="";
    this.recipientName="";
    this.recipientPhoneNumber="";
    this.buyerName="";
    this.buyerPhoneNumber="";
    this.dduckAddedList=[];
    this.memo="";
    this.price=null;
    this.paymentOptions="";
    this.paymentPlan="";
    this.advancedPayment=null;
    this.balancePayment=null;
    this.dduckName="";
    this.dduckAmount=null;
    this.dduckUnit="";
*/
    //When ORDER SAVE Button Clicked, Request server (JSON Format)  
    let body= {deliverTime:this.deliverTime, recipientAddress:this.recipientAddress,
    recipientAddressDetail:this.recipientAddressDetail, recipientName:this.recipientName,
    recipientPhoneNumber:this.recipientPhoneNumber, buyerName:this.buyerName,
    buyerPhoneNumber:this.buyerPhoneNumber, dduckAddedList:this.dduckAddedList,
    memo:this.memo, price:this.price, paymentOptions:this.paymentOptions,paymentPlan:this.paymentPlan,
    advancedPayment:this.advancedPayment, balancePayment:this.balancePayment};


    let url="https://8hiphr7dz1.execute-api.ap-northeast-2.amazonaws.com/test"; // for android,ios  
    //let url="http://localhost:8100/login"; // for ionic server
    let headers = new HttpHeaders({'Content-Type': 'application/json'});

    this.http.post(url,body, {headers:headers}).subscribe((res:any)=>{               
                console.log("res:"+JSON.stringify(res));
                let response=res;            
                if(response.result=="success"){
                    console.log("Save Success");
                    //this.navCtrl.setRoot(HomePage);
                }else{
                    let alert = this.alertCtrl.create({
                                title: '로그인에 실패했습니다.',
                                buttons: ['OK']
                            });
                    alert.present();
                }  
            },(err)=>{
                console.log("post-err:"+JSON.stringify(err));
            });
  }

  dduckAdd(){
    let dduckAdded={dduckName: this.dduckName, dduckAmount:this.dduckAmount, dduckUnit: this.dduckUnit}
    this.dduckAddedList.push(dduckAdded);
    //this.dduckName="";
    //this.dduckAmount=null;
    //this.dduckUnit="";
  }
  
  dduckminus(dduckSelect){
    this.dduckAddedList.splice(dduckSelect, 1);
  }


  //print function
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

  //get address function
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


  //////////////////////////        DELIVER SECTION       //////////////////////////////// 
  
  showlist(){
    console.log("ORDER CONTENT: " + JSON.stringify(this.orderList))
  }

  deliverManManage(){ //Deliver Personnel Page Navigate
    
  }














///// End of HOME.TS /////
}