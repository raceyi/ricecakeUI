import { Component ,NgZone} from '@angular/core';
import { NavController, App } from 'ionic-angular';
import * as moment from 'moment';
import { Platform } from 'ionic-angular/platform/platform';
import { AlertController } from 'ionic-angular/components/alert/alert-controller';
import { Page2Page } from '../page2/page2';
import { Page3Page } from '../page3/page3';
//import { HttpHeaders, HttpClient } from '@angular/common/http';
import { Button } from 'ionic-angular/components/button/button';


var gPage;

@Component({
  selector: 'page-home',
  templateUrl: 'home.html'
})
export class HomePage {
  currentPage: 'Page2Page';
  
  displayOrderDate;
  displayDeliverDate;
  //member variables//
  orderItems;
  myDate: string;

  deliveryTime: string;
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
  paymentMethod: string;
  payment: string;

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
  //redirectUrl="http://www.takit.biz";


  ////////////////////////////////////////////////////////////////////////////////////////
  //////////////////////////                              ////////////////////////////////
  //////////////////////////          CONSTRUCTOR         //////////////////////////////// 
  //////////////////////////                              ////////////////////////////////
  ////////////////////////////////////////////////////////////////////////////////////////
  
  constructor(
    private platform: Platform,
    public alertCtrl:AlertController, 
    public navCtrl: NavController,
    private ngZone:NgZone,
    private app: App){
      
    this.orderList=[{"buyerName":"리오","deliveryTime":"2018-03-22T14:30:22.605Z","recipientAddress":"서울 강남구 봉은사로 417 (삼성동)","recipientAddressDetail":"옆에","payment":"unpaid","recipientName":"쥬드","memo":"ㅋㅋㅋㅋ","paymentMethod":"card","carrier":"이서진","id":50,"price":"49000","recipientPhoneNumber":"01088889999","buyerPhoneNumber":"01099998888","hide":false,"menuList":[{"name":"녹두호박떡","amount":"6","unit":"말"}]},{"buyerName":"헨리","deliveryTime":"2018-03-22T17:30:01.052","recipientAddress":"서울 마포구 매봉산로 31 (상암동, S-PLEX CENTER)","recipientAddressDetail":"6층","recipientName":"세든","payment":"paid","memo":"감사","paymentMethod":"cash","carrier":null,"recipientPhoneNumber":"01088887777","price":"30000","id":49,"menuList":[{"name":"떡국떡","amount":"6","unit":"kg"},{"name":"바람떡","amount":"7","unit":"말"}],"buyerPhoneNumber":"01099998888","hide":false}];
    platform.ready().then(() => {
      console.log("Platform ready comes at homePage");

      let body ={deliveryDate: this.deliveryTime.substring(0,10)};    ///// Does it work?

  });
   gPage=this;

      this.initializeItems();
      var d = new Date();
      let milliseconds=d.getMilliseconds();
      var sss:string =milliseconds<100? ( milliseconds<10?'00'+milliseconds: '0'+milliseconds):milliseconds.toString();
      var ss = d.getSeconds() < 10? "0" + (d.getSeconds()) : (d.getSeconds());
      var mm = d.getMonth() < 9? "0" + (d.getMonth() + 1) : (d.getMonth() +1);
      var dd = d.getDate() <10? "0" + d.getDate() : d.getDate();
//    var dddd = d.getDay();
      var hh = d.getHours() <10? "0" + d.getHours() : d.getHours();
      var min = d.getMinutes() <10? "0"+d.getMinutes() : d.getMinutes();  
      var dString = d.getFullYear()+ '-' + (mm) + '-' + (dd) + 'T' + hh + ":" + min + ":" + ss + "." + sss;

      this.deliveryTime = dString;
      console.log("deliverTime: "+this.deliveryTime);

      let now=new Date();
      this.displayOrderDate={milliseconds:now.getTime() ,ios8601:dString};
      this.displayDeliverDate={milliseconds:now.getTime(), ios8601:dString};
  }



  ////////////////////////////////////////////////////////////////////////////////////////
  //////////////////////////                              ////////////////////////////////
  //////////////////////////        COMMON SECTION        //////////////////////////////// 
  //////////////////////////                              ////////////////////////////////
  ////////////////////////////////////////////////////////////////////////////////////////
  

  adminPage(){
    console.log("open administarator page");
    this.app.getRootNavs()[0].setRoot(Page2Page);
  }
    
  trashPage(){
    console.log("open trash page");
    this.app.getRootNavs()[0].setRoot(Page3Page);
  }

  getISOtime(time){  // milliseconds
    let d=new Date();
    d.setTime(time);
    var sss = d.getMilliseconds();
    var ss = d.getSeconds() < 10? "0" + (d.getSeconds()) : (d.getSeconds());
    var mm = d.getMonth() < 9? "0" + (d.getMonth() + 1) : (d.getMonth() +1);
    var dd = d.getDate() <10? "0" + d.getDate() : d.getDate();
    var hh = d.getHours() <10? "0" + d.getHours() : d.getHours();
    var min = d.getMinutes() <10? "0"+d.getMinutes() : d.getMinutes();
    var dString = d.getFullYear()+ '-' + (mm) + '-' + (dd) + 'T' + hh + ":" + min + ":" + ss + "." + sss;
    return dString;
  }

  orderGoYesterday(){  
    this.displayOrderDate.milliseconds=this.displayOrderDate.milliseconds-24*60*60*1000;
    console.log("order move yesterday:"+this.getISOtime(this.displayOrderDate.milliseconds));
    this.displayOrderDate.ios8601=this.getISOtime(this.displayOrderDate.milliseconds);
    this.deliveryTime=this.getISOtime(this.displayOrderDate.milliseconds);
    console.log("modified deliveryTime: " + this.deliveryTime);


    let body ={deliveryDate: this.deliveryTime.substring(0,10)};
  }

  orderGoTomorrow(){
    this.displayOrderDate.milliseconds=this.displayOrderDate.milliseconds+24*60*60*1000;
    console.log("order move tomorrow:"+this.getISOtime(this.displayOrderDate.milliseconds));
    this.displayOrderDate.ios8601=this.getISOtime(this.displayOrderDate.milliseconds);   
    this.deliveryTime=this.getISOtime(this.displayOrderDate.milliseconds);
    console.log("modified deliveryTime: " + this.deliveryTime);


    let body ={deliveryDate: this.deliveryTime.substring(0,10)};
  }

  deliverGoYesterday(){
    this.displayDeliverDate.milliseconds=this.displayDeliverDate.milliseconds-24*60*60*1000;
    console.log("deliver move yesterday:"+this.getISOtime(this.displayDeliverDate.milliseconds));
    this.displayDeliverDate.ios8601=this.getISOtime(this.displayDeliverDate.milliseconds);
    this.deliveryTime=this.getISOtime(this.displayOrderDate.milliseconds);
    console.log("modified deliveryTime: " + this.deliveryTime);


    let body ={deliveryDate: this.deliveryTime.substring(0,10)};
  }

  deliverGoTomorrow(){
    this.displayDeliverDate.milliseconds=this.displayDeliverDate.milliseconds+24*60*60*1000;
    console.log("deliver move tomorrow:"+this.getISOtime(this.displayDeliverDate.milliseconds));
    this.displayDeliverDate.ios8601=this.getISOtime(this.displayDeliverDate.milliseconds);
    this.deliveryTime=this.getISOtime(this.displayOrderDate.milliseconds);
    console.log("modified deliveryTime: " + this.deliveryTime);


    let body ={deliveryDate: this.deliveryTime.substring(0,10)};
  }

  produceGoYesterday(){
    this.displayDeliverDate.milliseconds=this.displayDeliverDate.milliseconds-24*60*60*1000;
    console.log("produce move yesterday:"+this.getISOtime(this.displayDeliverDate.milliseconds));
    this.displayDeliverDate.ios8601=this.getISOtime(this.displayDeliverDate.milliseconds);

    //Get menus from server??
    //how to?
  }

  produceGoTomorrow(){
    this.displayDeliverDate.milliseconds=this.displayDeliverDate.milliseconds+24*60*60*1000;
    console.log("produce move tomorrow:"+this.getISOtime(this.displayDeliverDate.milliseconds));
    this.displayDeliverDate.ios8601=this.getISOtime(this.displayDeliverDate.milliseconds);

    //Get menus from server?
    //how to?
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
/*
   this.orderList= [{"buyerName":"조씨","deliveryTime":"2018-03-19T14:09:50.634","recipientAddress":"도로명 주소 선택","recipientAddressDetail":"11층","recipientName":"김씨","payment":"paid","memo":"ㅁㅁ","paymentMethod":"cash","carrier":null,"recipientPhoneNumber":"65433","price":"33333","id":31,"menuList":"[{\"name\":\"콩송편\",\"amount\":\"3\",\"unit\":\"개\"},{\"name\":\"쑥가래떡\",\"amount\":\"2\",\"unit\":\"접시\"}]","buyerPhoneNumber":"9876","hide":false},{"buyerName":"홍","deliveryTime":"2018-03-19T20:00:20.699Z","recipientAddress":"도로명 주소 선택","recipientAddressDetail":"11층","recipientName":"박","payment":"unpaid","memo":"오로오로","paymentMethod":"card","carrier":null,"recipientPhoneNumber":"8888","price":"44444","id":26,"menuList":"[{\"name\":\"현미쑥가래떡\",\"amount\":\"5\",\"unit\":\"접시\"}]","buyerPhoneNumber":"99999","hide":false},{"buyerName":"홍길동","deliveryTime":"2018-03-19T14:09:50.634","recipientAddress":"도로명 주소 선택","recipientAddressDetail":"ㅊ층수","recipientName":"박철수","payment":"unpaid","memo":"메모","paymentMethod":"card","carrier":null,"recipientPhoneNumber":"888888","price":"40000","id":30,"menuList":"[{\"name\":\"콩송편\",\"amount\":\"6\",\"unit\":\"접시\"}]","buyerPhoneNumber":"99999","hide":false},{"buyerName":"홍","deliveryTime":"2018-03-19T23:48:14.440Z","recipientAddress":"도로명 주소 선택","recipientAddressDetail":"11층","recipientName":"벅","payment":"unpaid","memo":"ㅎㅎㅎㅎ","paymentMethod":"card","carrier":null,"recipientPhoneNumber":"888888","price":"555555","id":28,"menuList":"[{\"name\":\"콩송편\",\"amount\":\"5\",\"unit\":\"접시\"}]","buyerPhoneNumber":"9999","hide":false}]
   this.orderList.forEach(order=>{
    let menuList=order.menuList;
    order.menuList=JSON.parse(menuList);
  })
*/
/*
  this.platform.ready().then(() => {
 
  let body ={deliveryDate: this.deliveryTime.substring(0,10)};
  let url = "https://8ca0a9qq5g.execute-api.ap-northeast-2.amazonaws.com/latest/getOrderWithDeliveryDate";
  console.log("body:"+JSON.stringify(body));
  this.http.post(url, body, {}).then((res:any)=>{
    let response=JSON.parse(res.data);
    console.log("res:"+JSON.stringify(response));
    if(response.result=="success"){
      response.orders.forEach(order=>{
             let menuList=order.menuList;
             order.menuList=JSON.parse(menuList);
        })
        this.orderList=response.orders;
        console.log("orderList:"+JSON.stringify(this.orderList));
    }else{
      console.log("res.result is failure");
    }
  })
  
  let body ={deliveryDate: this.deliveryTime.substring(0,10)};
  let url = "https://8ca0a9qq5g.execute-api.ap-northeast-2.amazonaws.com/latest/getOrderWithDeliveryDate";
  console.log("body:"+JSON.stringify(body));
  this.http.post(url, body).subscribe((response:any)=>{
    if(response.result=="success"){
      response.orders.forEach(order=>{
             let menuList=order.menuList;
             order.menuList=JSON.parse(menuList);
        })
        this.orderList=response.orders;
        console.log("orderList:"+JSON.stringify(this.orderList));
    }else{
      console.log("res.result is failure");
    }
  })

});*/
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

    console.log("         Here is Order Section!          ");
    console.log("orderButton-orderList: " + JSON.stringify(this.orderList));
  }

  deliverButton() {
    this.deliverButtonColor = "#508AE4";
    this.orderButtonColor = "#e1e1e1";
    this.produceButtonColor = "#e1e1e1";

    this.orderButtonFlag = true;
    this.produceButtonFlag = true;
    this.deliverButtonFlag = false;
   
    console.log("         Here is Deliver Section!          ");
    console.log("deliverButton-orderList:"+JSON.stringify(this.orderList));
  }

  produceButton() {
    this.produceButtonColor = "#508AE4";
    this.orderButtonColor = "#e1e1e1";
    this.deliverButtonColor = "#e1e1e1";

    this.orderButtonFlag = true;
    this.deliverButtonFlag = true;
    this.produceButtonFlag = false;

    console.log("         Here is Produce Section!          ");
    console.log("produceButton-orderList")
  }



  ////////////////////////////////////////////////////////////////////////////////////////
  //////////////////////////                              ////////////////////////////////
  //////////////////////////         ORDER SECTION        //////////////////////////////// 
  //////////////////////////                              ////////////////////////////////
  ////////////////////////////////////////////////////////////////////////////////////////
  
  save(){
    /*if(this.recipientAddress == "도로명 주소 선택"){
      let alert = this.alertCtrl.create({
        title: '도로명 주소를 선택하세요.',
        buttons: ['확인']
      });
      alert.present();
      return ;
    }

    if(!this.recipientAddressDetail){
      let alert = this.alertCtrl.create({
        title:'상세주소를 입력하세요.',
        buttons: ['확인']
      });
      alert.present();
      return ;
    }

    if(!this.recipientName){
      let alert = this.alertCtrl.create({
        title: '받는사람 이름을 입력하세요.',
        buttons: ['확인']
      });
      alert.present();
      return ;
    }

    if(!this.recipientPhoneNumber){
      let alert = this.alertCtrl.create({
        title: '받는사람 전화번호를 입력하세요.',
        buttons: ['확인']
      });
      alert.present();
      return ;
    }

    if(!this.buyerName){
      let alert = this.alertCtrl.create({
        title: '구매자 이름을 입력하세요.',
        buttons: ['확인']
      });
      alert.present();
      return ;
    }
   
    if(!this.buyerPhoneNumber){
      let alert = this.alertCtrl.create({
        title: '구매자 전화번호를 입력하세요.',
        buttons: ['확인']
      });
      alert.present();
      return ;
    }

    if(this.dduckAddedList.length==0){
      let alert = this.alertCtrl.create({
        title: '떡 종류를 선택하세요. (떡 종류 / 수량 / 단위 선택 후 떡 추가 버튼 누르기)',
        buttons: ['확인']
      });
      alert.present();
      return ;
    }

    if(this.price == null){
      let alert = this.alertCtrl.create({
        title: '가격을 입력하세요.',
        buttons: ['확인']
      });
      alert.present();
      return ;
    }

    if(!this.paymentMethod){
      let alert = this.alertCtrl.create({
        title: '결제 수단을 선택하세요.',
        buttons: ['확인']
      });
      alert.present();
      return ;
    }

    if(!this.payment){
      let alert = this.alertCtrl.create({
        title: '결제 방법을 선택하세요.',
        buttons: ['확인']
      });
      alert.present();
      return ;
    }*/

    let order={deliveryTime: this.deliveryTime, recipientAddress: this.recipientAddress, 
      recipientAddressDetail: this.recipientAddressDetail, recipientName: this.recipientName, 
      recipientPhoneNumber: this.recipientPhoneNumber, buyerName: this.buyerName, 
      buyerPhoneNumber: this.buyerPhoneNumber, menuList:JSON.stringify(this.dduckAddedList), 
      memo: this.memo, price: this.price, paymentMethod: this.paymentMethod, payment: this.payment
    }

    
     // menuList:JSON.stringify([{name:"백설기", amount:2,unit:"말"},{name:"호박떡", amount:1,unit:"말"} ]), 
    //this.orderList.push(order);
    //console.log("orderList:"+JSON.stringify(this.orderList));
    
    //Initialize Input order
    this.deliveryTime=this.deliveryTime;
    this.recipientAddress="도로명 주소 선택";
    this.recipientAddressDetail="";
    this.recipientName="";
    this.recipientPhoneNumber="";
    this.buyerName="";
    this.buyerPhoneNumber="";
    this.dduckAddedList=[];
    this.memo="";
    this.price=null;
    this.paymentMethod="";
    this.payment="";
    this.dduckName="";
    this.dduckAmount=null;
    this.dduckUnit="";

    let body = {order:order};
    //When ORDER SAVE Button Clicked, Request server (JSON Format)  
   // let order = {deliveryTime:this.deliveryTime, recipientAddress:this.recipientAddress,
   // recipientAddressDetail:this.recipientAddressDetail, recipientName:this.recipientName,
   // recipientPhoneNumber:this.recipientPhoneNumber, buyerName:this.buyerName,
   // buyerPhoneNumber:this.buyerPhoneNumber, dduckAddedList:this.dduckAddedList,
   // memo:this.memo, price:this.price, paymentMethod:this.paymentMethod, payment:this.payment
    //orderIndex: this.orderIndex, deliveryMan: this.deliveryMan
  //};

    //let url="https://8ca0a9qq5g.execute-api.ap-northeast-2.amazonaws.com/latest/addOrder"; // for android,ios  
    //let url="http://localhost:8100/login"; // for ionic server
          
  }

  dduckAdd(){
    let dduckAdded={name: this.dduckName, amount:this.dduckAmount, unit: this.dduckUnit}
    this.dduckAddedList.push(dduckAdded);
    this.dduckName="";
    this.dduckAmount=null;
    this.dduckUnit="";
  }
  
  dduckminus(dduckSelect){
    this.dduckAddedList.splice(dduckSelect, 1);
  }


  //print function
  print(){
    
    var page = '<h1>Hello Document</h1>';

     
  }
  //get address function
  getJuso(){
  }

  ////////////////////////////////////////////////////////////////////////////////////////
  //////////////////////////                              ////////////////////////////////
  //////////////////////////        DELIVER SECTION       //////////////////////////////// 
  //////////////////////////                              ////////////////////////////////
  ////////////////////////////////////////////////////////////////////////////////////////
  

  deliverManManage(){ //Deliver Personnel Page Navigate
    
  }

  selectDeliveryMan(order){ //When user choose delivery Man with order
    console.log("carrier:"+order.carrier);
    console.log("chosen delivery Man Name: " + JSON.stringify(this.deliveryMan));
    //
    //
    // Send order index & deliveryMan to server
    //
    //
    //
  }












  ////////////////////////////////////////////////////////////////////////////////////////
  //////////////////////////                              ////////////////////////////////
  //////////////////////////        PRODUCE SECTION       //////////////////////////////// 
  //////////////////////////                              ////////////////////////////////
  ////////////////////////////////////////////////////////////////////////////////////////
  

///// End of HOME.TS /////
}