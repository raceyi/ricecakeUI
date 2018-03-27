import { Component ,NgZone} from '@angular/core';
import { NavController, App } from 'ionic-angular';
import * as moment from 'moment';
import { InAppBrowser } from '@ionic-native/in-app-browser'
import { Printer, PrintOptions } from '@ionic-native/printer'
import { Platform } from 'ionic-angular/platform/platform';
import { AlertController } from 'ionic-angular/components/alert/alert-controller';
import { Page2Page } from '../page2/page2';
import { Page3Page } from '../page3/page3';
//import { HttpHeaders, HttpClient } from '@angular/common/http';
import { Button } from 'ionic-angular/components/button/button';
import {HTTP} from '@ionic-native/http'


var gPage;

@Component({
  selector: 'page-home',
  templateUrl: 'home.html'
})
export class HomePage {
  currentPage: Page2Page;
  
  displayOrderDate;
  displayDeliverDate;
  displayProduceDate;
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
  carrier: string;
  deliveryMan: string;

  //ngFor variables//
  orderList=[];
  dduckAddedList=[];
  menus=[];
  carriers=[];
  categorySelected:number=-1;

  //get address variable
  display: string="order";

  browserRef;
  done:boolean=false;
  redirectUrl="http://www.takit.biz";


  ////////////////////////////////////////////////////////////////////////////////////////
  //////////////////////////                              ////////////////////////////////
  //////////////////////////          CONSTRUCTOR         //////////////////////////////// 
  //////////////////////////                              ////////////////////////////////
  ////////////////////////////////////////////////////////////////////////////////////////
  
  constructor(
    private http: HTTP,
    private platform: Platform,
    public alertCtrl:AlertController, 
    public navCtrl: NavController,
    private iab: InAppBrowser,
    private ngZone:NgZone,
    private printer: Printer,
    private app: App){
      
    platform.ready().then(() => {
      console.log("Platform ready comes at homePage");
     /////////////////////////////////////////////////
      this.printer.isAvailable().then((avail)=>{
          console.log("avail:"+avail);
          this.printer.check().then((output)=>{
            console.log("output:"+JSON.stringify(output));
          },err=>{

          });
      }, (err)=>{
          console.log("err:"+JSON.stringify(err));
      });
      //////////////////////////////////////////////////
      let body ={deliveryDate: this.deliveryTime.substring(0,10)};    ///// Does it work?
      this.http.setDataSerializer("json"); 
      this.http.post("https://8ca0a9qq5g.execute-api.ap-northeast-2.amazonaws.com/latest/getOrderWithDeliveryDate",body,{"Content-Type":"application/json"}).then((res:any)=>{              
          console.log("res:"+JSON.stringify(res));
          let response=JSON.parse(res.data);
          console.log("getOrderWithDeliverDate response: " + JSON.stringify(response));
          if(response.result=="success"){
            response.orders.forEach(order=>{
              let menuList = order.menuList;
              order.menuList = JSON.parse(menuList);
            })
            this.orderList = response.orders;
            console.log("orderList: " + JSON.stringify(this.orderList));
          }
      },(err)=>{
          console.log("err:"+JSON.stringify(err));
      });


      //Get Menus
      body = null;
      this.http.setDataSerializer("json"); 
      this.http.post("https://8ca0a9qq5g.execute-api.ap-northeast-2.amazonaws.com/latest/getMenus",body,{"Content-Type":"application/json"}).then((res:any)=>{              
        console.log("res:"+JSON.stringify(res));
        let response=JSON.parse(res.data);
        console.log("response: " + JSON.stringify(response));
        let menus=response.menus;
        menus.sort(function(a,b){
              if (a.category < b.category) return -1;
              if (a.category > b.category) return 1;
              if(a.menu<b.menu) return -1;
              if(a.menu>b.menu) return 1;
              return 0;
        });
        console.log("sorted menus:"+JSON.stringify(menus));
        let categories=[];
        menus.forEach(menu=>{
            if(categories.indexOf(menu.category)==-1){
              categories.push(menu.category);
            }
        })
        let menuInfos=[];
        categories.forEach(category=>{
            menuInfos.push({category:category,menus:[]});
        })
        console.log("menuInfos-1:"+JSON.stringify(menuInfos));
        menus.forEach(menu=>{
             let menuString=menu.menu;
             /*
             if(menu.menu.indexOf("[")==0){
                let menuObjs=JSON.parse(name);
                console.log("menuObj:"+JSON.stringify(menuObjs));
                let menuString="";
                menuObjs.forEach(menuObj=>{
                   let key:any=Object.keys(menuObj);
                   menuString+=key+menuObj[key]+" ";
                });
             }
             console.log("menuString:"+menuString);
             */
             if(menu.category=="십리향1송이")
                menuInfos[categories.indexOf(menu.category)].menus.push("모듬찰떡1 단호박소담1 완두시루떡1");
             else    
                menuInfos[categories.indexOf(menu.category)].menus.push(menu.menu);
        })     
        
        if(response.result=="success"){
          //this.menus = response.menus;
          this.menus = menuInfos;
          console.log("menus: " + JSON.stringify(this.menus));
        }
    },(err)=>{
        console.log("err:"+JSON.stringify(err));
    });


    //Get Carriers
    body = null;
      this.http.setDataSerializer("json"); 
      this.http.post("https://8ca0a9qq5g.execute-api.ap-northeast-2.amazonaws.com/latest/getCarriers",body,{"Content-Type":"application/json"}).then((res:any)=>{              
        console.log("res:"+JSON.stringify(res));
        let response=JSON.parse(res.data);
        console.log("response: " + JSON.stringify(response));
        if(response.result=="success"){
          this.carriers = response.carriers;
          
          console.log("carriers: " + JSON.stringify(this.carriers));
        }
    },(err)=>{
        console.log("err:"+JSON.stringify(err));
    });

/*
      this.printer.isAvailable().then((avail)=>{
          console.log("With constructor Is print available??: "+avail);
          this.printer.check().then((output)=>{
            console.log("With constructor check print output: "+JSON.stringify(output));
            let alert = this.alertCtrl.create({
              title: 'check output.'+JSON.stringify(output),
              buttons: ['확인']
            });
            alert.present();
            this.printer.pick().then((res)=>{

            },err=>{

            })
          },err=>{
            let alert = this.alertCtrl.create({
              title: 'check output-error.'+JSON.stringify(err),
              buttons: ['확인']
            });
            alert.present();

          });
      }, (err)=>{
          console.log("With constructor print err:"+JSON.stringify(err));
          let alert = this.alertCtrl.create({
            title: 'avail error-output.'+JSON.stringify(err),
            buttons: ['확인']
          });
          alert.present();

        });
*/
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
      this.displayProduceDate={milliseconds:now.getTime(), ios8601:dString};
  }



  ////////////////////////////////////////////////////////////////////////////////////////
  //////////////////////////                              ////////////////////////////////
  //////////////////////////        COMMON SECTION        //////////////////////////////// 
  //////////////////////////                              ////////////////////////////////
  ////////////////////////////////////////////////////////////////////////////////////////
  

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
        this.http.setDataSerializer("json"); 
        this.http.post("https://8ca0a9qq5g.execute-api.ap-northeast-2.amazonaws.com/latest/getOrderWithDeliveryDate",body,{"Content-Type":"application/json"}).then((res:any)=>{              
          console.log("res:"+JSON.stringify(res));
          let response=JSON.parse(res.data);
          if(response.result=="success"){
            response.orders.forEach(order=>{
              let menuList = order.menuList;
              order.menuList = JSON.parse(menuList);
            })
            this.orderList = response.orders;
            console.log("orderList: " + JSON.stringify(this.orderList));
          }
      },(err)=>{
          console.log("err:"+JSON.stringify(err));
      });
  }

  orderGoTomorrow(){
    this.displayOrderDate.milliseconds=this.displayOrderDate.milliseconds+24*60*60*1000;
    console.log("order move tomorrow:"+this.getISOtime(this.displayOrderDate.milliseconds));
    this.displayOrderDate.ios8601=this.getISOtime(this.displayOrderDate.milliseconds);   
    this.deliveryTime=this.getISOtime(this.displayOrderDate.milliseconds);
    console.log("modified deliveryTime: " + this.deliveryTime);


    let body ={deliveryDate: this.deliveryTime.substring(0,10)};
        this.http.setDataSerializer("json"); 
        this.http.post("https://8ca0a9qq5g.execute-api.ap-northeast-2.amazonaws.com/latest/getOrderWithDeliveryDate",body,{"Content-Type":"application/json"}).then((res:any)=>{              
          console.log("res:"+JSON.stringify(res));
          let response=JSON.parse(res.data);
          if(response.result=="success"){
            response.orders.forEach(order=>{
              let menuList = order.menuList;
              order.menuList = JSON.parse(menuList);
            })
            this.orderList = response.orders;
            console.log("orderList: " + JSON.stringify(this.orderList));
          }
      },(err)=>{
          console.log("err:"+JSON.stringify(err));
      });
  }

  deliverGoYesterday(){
    this.displayDeliverDate.milliseconds=this.displayDeliverDate.milliseconds-24*60*60*1000;
    console.log("deliver move yesterday:"+this.getISOtime(this.displayDeliverDate.milliseconds));
    this.displayDeliverDate.ios8601=this.getISOtime(this.displayDeliverDate.milliseconds);
    this.deliveryTime=this.getISOtime(this.displayDeliverDate.milliseconds);
    console.log("modified deliveryTime: " + this.deliveryTime);


    let body ={deliveryDate: this.deliveryTime.substring(0,10)};
        this.http.setDataSerializer("json"); 
        this.http.post("https://8ca0a9qq5g.execute-api.ap-northeast-2.amazonaws.com/latest/getOrderWithDeliveryDate",body,{"Content-Type":"application/json"}).then((res:any)=>{              
          console.log("res:"+JSON.stringify(res));
          let response=JSON.parse(res.data);
          if(response.result=="success"){
            response.orders.forEach(order=>{
              let menuList = order.menuList;
              order.menuList = JSON.parse(menuList);
            })
            this.orderList = response.orders;
            console.log("orderList: " + JSON.stringify(this.orderList));
          }
      },(err)=>{
          console.log("err:"+JSON.stringify(err));
      });
  }

  deliverGoTomorrow(){
    this.displayDeliverDate.milliseconds=this.displayDeliverDate.milliseconds+24*60*60*1000;
    console.log("deliver move tomorrow:"+this.getISOtime(this.displayDeliverDate.milliseconds));
    this.displayDeliverDate.ios8601=this.getISOtime(this.displayDeliverDate.milliseconds);
    this.deliveryTime=this.getISOtime(this.displayDeliverDate.milliseconds);
    console.log("modified deliveryTime: " + this.deliveryTime);


    let body ={deliveryDate: this.deliveryTime.substring(0,10)};
        this.http.setDataSerializer("json"); 
        this.http.post("https://8ca0a9qq5g.execute-api.ap-northeast-2.amazonaws.com/latest/getOrderWithDeliveryDate",body,{"Content-Type":"application/json"}).then((res:any)=>{              
          console.log("res:"+JSON.stringify(res));
          let response=JSON.parse(res.data);
          if(response.result=="success"){
            response.orders.forEach(order=>{
              let menuList = order.menuList;
              order.menuList = JSON.parse(menuList);
            })
            this.orderList = response.orders;
            console.log("orderList: " + JSON.stringify(this.orderList));
          }
      },(err)=>{
          console.log("err:"+JSON.stringify(err));
      });
  }

  produceGoYesterday(){
    this.displayProduceDate.milliseconds=this.displayProduceDate.milliseconds-24*60*60*1000;
    console.log("produce move yesterday:"+this.getISOtime(this.displayProduceDate.milliseconds));
    this.displayProduceDate.ios8601=this.getISOtime(this.displayProduceDate.milliseconds);
    this.deliveryTime=this.getISOtime(this.displayProduceDate.milliseconds);
    console.log("modified deliveryTime: " + this.deliveryTime);
    
    let body ={deliveryDate: this.deliveryTime.substring(0,10)};
    this.http.setDataSerializer("json"); 
    this.http.post("https://8ca0a9qq5g.execute-api.ap-northeast-2.amazonaws.com/latest/getOrderWithDeliveryDate",body,{"Content-Type":"application/json"}).then((res:any)=>{              
      console.log("res:"+JSON.stringify(res));
      let response=JSON.parse(res.data);
      if(response.result=="success"){
        response.orders.forEach(order=>{
          let menuList = order.menuList;
          order.menuList = JSON.parse(menuList);
        })
        this.orderList = response.orders;
        console.log("orderList: " + JSON.stringify(this.orderList));
      }
  },(err)=>{
      console.log("err:"+JSON.stringify(err));
  });
  }

  produceGoTomorrow(){
    this.displayProduceDate.milliseconds=this.displayProduceDate.milliseconds+24*60*60*1000;
    console.log("produce move tomorrow:"+this.getISOtime(this.displayProduceDate.milliseconds));
    this.displayProduceDate.ios8601=this.getISOtime(this.displayProduceDate.milliseconds);
    this.deliveryTime=this.getISOtime(this.displayProduceDate.milliseconds);
    console.log("modified deliveryTime: " + this.deliveryTime);
    let body ={deliveryDate: this.deliveryTime.substring(0,10)};
    this.http.setDataSerializer("json"); 
    this.http.post("https://8ca0a9qq5g.execute-api.ap-northeast-2.amazonaws.com/latest/getOrderWithDeliveryDate",body,{"Content-Type":"application/json"}).then((res:any)=>{              
      console.log("res:"+JSON.stringify(res));
      let response=JSON.parse(res.data);
      if(response.result=="success"){
        response.orders.forEach(order=>{
          let menuList = order.menuList;
          order.menuList = JSON.parse(menuList);
        })
        this.orderList = response.orders;
        console.log("orderList: " + JSON.stringify(this.orderList));
      }
  },(err)=>{
      console.log("err:"+JSON.stringify(err));
  });
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

    console.log("                   Here is Order Section!                   ");
    console.log("orderButton-orderList: " + JSON.stringify(this.orderList));
  }

  deliverButton() {
    this.deliverButtonColor = "#508AE4";
    this.orderButtonColor = "#e1e1e1";
    this.produceButtonColor = "#e1e1e1";

    this.orderButtonFlag = true;
    this.produceButtonFlag = true;
    this.deliverButtonFlag = false;
   
    console.log("                    Here is Deliver Section!                   ");
    console.log("deliverButton-orderList:"+JSON.stringify(this.orderList));
  }

  produceButton() {
    this.produceButtonColor = "#508AE4";
    this.orderButtonColor = "#e1e1e1";
    this.deliverButtonColor = "#e1e1e1";

    this.orderButtonFlag = true;
    this.deliverButtonFlag = true;
    this.produceButtonFlag = false;

    console.log("                     Here is Produce Section!                     ");
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
    }*/

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
    }

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

    let url="https://8ca0a9qq5g.execute-api.ap-northeast-2.amazonaws.com/latest/addOrder"; // for android,ios  
    //let url="http://localhost:8100/login"; // for ionic server
    this.http.setDataSerializer("json"); 
    this.http.post(url,body, {"Content-Type":"application/json"}).then((res:any)=>{
                console.log("You Clicked the saving order");               
                let response=JSON.parse(res.data);            
                if(response.result=="success"){
                    console.log("Order Save Success");
                    let body ={deliveryDate: this.deliveryTime.substring(0,10)};
                    url = "https://8ca0a9qq5g.execute-api.ap-northeast-2.amazonaws.com/latest/getOrderWithDeliveryDate";
                    this.http.post(url, body, {"Content-Type":"application/json"}).then((res:any)=>{
                      res = JSON.parse(res.data);
                      if(res.result=="success"){
                        this.ngZone.run(()=>{
                          res.orders.forEach(order=>{ 
                             order.menuList=JSON.parse(order.menuList);
                           });
                          this.orderList=res.orders;
                        })
                      }else{
                        console.log("Order that you saved is delivered to server & DB successfully but showing of that save order is failure");
                      }
                    })
                }else{
                    let alert = this.alertCtrl.create({
                                title: '주문 저장에 실패했습니다.',
                                buttons: ['OK']
                            });
                    alert.present();
                }  
            },(err)=>{
                console.log("order save post-err:"+JSON.stringify(err));
            });
            
          
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

  confirmHideOrder(id){
    console.log("confirmHide Order ID: " + JSON.stringify(id));
    let alert = this.alertCtrl.create({
      title: '해당 주문을 삭제하시겠습니까?',
      buttons:[
        {
          text: '삭제',
          handler: () =>{
            console.log("That order is moved to trash Page");
            this.hideOrder(id);
          }
        },

        {
          text: '취소',
          handler: () =>{
            console.log("cancel that order moved");
            return;
          }
        }
      ]
    })
  }

  hideOrder(id){ //delete order == move order to trash page == hide order from user
      let body = id;
      this.http.setDataSerializer("json"); 
      this.http.post("https://8ca0a9qq5g.execute-api.ap-northeast-2.amazonaws.com/latest/hideOrder",body,{"Content-Type":"application/json"}).then((res:any)=>{              
        console.log("res:"+JSON.stringify(res));
        let response=JSON.parse(res.data);
        if(response.result=="success"){
          response.orders.forEach(order=>{
            let menuList = order.menuList;
            order.menuList = JSON.parse(menuList);
          })
          this.orderList = response.orders;
          console.log("orderList: " + JSON.stringify(this.orderList));
        }
    },(err)=>{
        console.log("err:"+JSON.stringify(err));
    });
  }

  modifyOrder(){ //modify order
    
  }

  //print function
  print(){
    
    var page;

    if(!this.deliverButtonFlag){
      console.log("deliver page printout");
      page="<html>\
<meta http-equiv=\"Content-Type\" content=\"text/html; charset=utf-8\" />\
      <H1> 배달자:홍길동 배달수: 5개 (2018년 3월 22일 목요일)</H1>\
  <H1>1/5</H1>\
  <table style=\"width:100%;border-collapse:collapse;\">\
  <tr>\
    <td style=\"border: solid 1px; font-size:0.8em;\" colspan=\"4\">배달지:경기 고양시 덕양구 호수로 3(토당동,덕양상가) 그레이스 6층</td>\
  </tr>\
  <tr>\
      <td width=\"15%\" style=\"border: solid 1px; font-size:0.8em;\">배달요청시간</td>\
      <td width=\"35%\"style=\"border: solid 1px; font-size:0.8em;\">11시 50분 </td>\
      <td width=\"10%\" style=\"border: solid 1px; font-size:0.8em;\">수신자</td>\
      <td style=\"border: solid 1px; font-size:0.8em;\">이경주 010-1232-4567 </td>\
  </tr>\
  <tr>\
      <td width=\"15%\" style=\"border: solid 1px; font-size:0.8em;\">주문금액</td>\
      <td width=\"35%\"style=\"border: solid 1px; font-size:0.8em;\">30,000원(배달료 0원) </td>\
      <td width=\"10%\" style=\"border: solid 1px; font-size:0.8em;\">결제</td>\
      <td style=\"border: solid 1px; font-size:0.8em;\">현금(완납)</td>\
  </tr>\
  <tr>\
      <td width=\"20%\" style=\"border: solid 1px; font-size:0.8em;\">주문자 </td>\
      <td style=\"border: solid 1px; font-size:0.8em;\" colspan=\"3\">김영희 010-1232-4567 <span>(접수:2018년 1월 25일 15시 30분)</span> </td>\
  </tr>\
  <tr>\
    <td style=\"border: solid 1px; font-size:0.8em;\" width=\"100%\" colspan=\"4\">\
      멥떡-가래떡 2kg<br>\
      시루떡-찹쌀 0.5말\
    </td>\
  </tr> \
  <tr>\
    <td style=\"border: solid 1px; font-size:0.8em;\" width=\"100%\" colspan=\"4\">\
      이쁘게 포장해주세요.\
    </td>\
  </tr> \
  </table>\
  <br>\
  <H1>2/5</H1>\
    <table style=\"width:100%;border-collapse:collapse;\">\
  <tr>\
    <td style=\"border: solid 1px; font-size:0.8em;\" colspan=\"4\">배달지:경기 고양시 덕양구 호수로 3(토당동,덕양상가) 그레이스 6층</td>\
  </tr>\
  <tr>\
      <td width=\"15%\" style=\"border: solid 1px; font-size:0.8em;\">배달요청시간</td>\
      <td width=\"35%\"style=\"border: solid 1px; font-size:0.8em;\">11시 50분 </td>\
      <td width=\"10%\" style=\"border: solid 1px; font-size:0.8em;\">수신자</td>\
      <td style=\"border: solid 1px; font-size:0.8em;\">이경주 010-1232-4567 </td>\
  </tr>\
  <tr>\
      <td width=\"15%\" style=\"border: solid 1px; font-size:0.8em;\">주문금액</td>\
      <td width=\"35%\"style=\"border: solid 1px; font-size:0.8em;\">30,000원(배달료 0원) </td>\
      <td width=\"10%\" style=\"border: solid 1px; font-size:0.8em;\">결제</td>\
      <td style=\"border: solid 1px; font-size:0.8em;\">현금(완납)</td>\
  </tr>\
  <tr>\
      <td width=\"20%\" style=\"border: solid 1px; font-size:0.8em;\">주문자 </td>\
      <td style=\"border: solid 1px; font-size:0.8em;\" colspan=\"3\">김영희 010-1232-4567 <span>(접수:2018년 1월 25일 15시 30분)</span> </td>\
  </tr>\
  <tr>\
    <td style=\"border: solid 1px; font-size:0.8em;\" width=\"100%\" colspan=\"4\">\
      멥떡-가래떡 2kg<br>\
      시루떡-찹쌀 0.5말\
    </td>\
  </tr> \
  <tr>\
    <td style=\"border: solid 1px; font-size:0.8em;\" width=\"100%\" colspan=\"4\">\
      이쁘게 포장해주세요.\
    </td>\
  </tr> \
  </table>";
    } 
    if(!this.orderButtonFlag){
      console.log("order page printout");
      page="<html>\
<meta http-equiv=\"Content-Type\" content=\"text/html; charset=utf-8\" />\
  <H1> 배달일: 2018년 3월 22일 목요일 주문수:5개 </H1>\
  <H1>1/5</H1>\
  <table style=\"width:100%;border-collapse:collapse;\">\
  <tr>\
    <td style=\"border: solid 1px; font-size:0.8em;\" colspan=\"4\">배달지:경기 고양시 덕양구 호수로 3(토당동,덕양상가) 그레이스 6층</td>\
  </tr>\
  <tr>\
      <td width=\"15%\" style=\"border: solid 1px; font-size:0.8em;\">배달요청시간</td>\
      <td width=\"35%\"style=\"border: solid 1px; font-size:0.8em;\">11시 50분 </td>\
      <td width=\"10%\" style=\"border: solid 1px; font-size:0.8em;\">수신자</td>\
      <td style=\"border: solid 1px; font-size:0.8em;\">이경주 010-1232-4567 </td>\
  </tr>\
  <tr>\
      <td width=\"15%\" style=\"border: solid 1px; font-size:0.8em;\">주문금액</td>\
      <td width=\"35%\"style=\"border: solid 1px; font-size:0.8em;\">30,000원(배달료 0원) </td>\
      <td width=\"10%\" style=\"border: solid 1px; font-size:0.8em;\">결제</td>\
      <td style=\"border: solid 1px; font-size:0.8em;\">현금(완납)</td>\
  </tr>\
  <tr>\
      <td width=\"20%\" style=\"border: solid 1px; font-size:0.8em;\">주문자 </td>\
      <td style=\"border: solid 1px; font-size:0.8em;\" colspan=\"3\">김영희 010-1232-4567 <span>(접수:2018년 1월 25일 15시 30분)</span> </td>\
  </tr>\
  <tr>\
      <td width=\"15%\" style=\"border: solid 1px; font-size:0.8em;\">배달자</td>\
      <td style=\"border: solid 1px; font-size:0.8em;\" colspan=\"3\">미정 </td>\
  </tr>\
  <tr>\
    <td style=\"border: solid 1px; font-size:0.8em;\" width=\"100%\" colspan=\"4\">\
      멥떡-가래떡 2kg<br>\
      시루떡-찹쌀 0.5말\
    </td>\
  </tr> \
  <tr>\
    <td style=\"border: solid 1px; font-size:0.8em;\" width=\"100%\" colspan=\"4\">\
      이쁘게 포장해주세요.\
    </td>\
  </tr> \
  </table>\
  <br>\
  <H1>2/5</H1>\
    <table style=\"width:100%;border-collapse:collapse;\">\
  <tr>\
    <td style=\"border: solid 1px; font-size:0.8em;\" colspan=\"4\">배달지:경기 고양시 덕양구 호수로 3(토당동,덕양상가) 그레이스 6층</td>\
  </tr>\
  <tr>\
      <td width=\"15%\" style=\"border: solid 1px; font-size:0.8em;\">배달요청시간</td>\
      <td width=\"35%\"style=\"border: solid 1px; font-size:0.8em;\">11시 50분 </td>\
      <td width=\"10%\" style=\"border: solid 1px; font-size:0.8em;\">수신자</td>\
      <td style=\"border: solid 1px; font-size:0.8em;\">이경주 010-1232-4567 </td>\
  </tr>\
  <tr>\
      <td width=\"15%\" style=\"border: solid 1px; font-size:0.8em;\">주문금액</td>\
      <td width=\"35%\"style=\"border: solid 1px; font-size:0.8em;\">30,000원(배달료 0원) </td>\
      <td width=\"10%\" style=\"border: solid 1px; font-size:0.8em;\">결제</td>\
      <td style=\"border: solid 1px; font-size:0.8em;\">현금(완납)</td>\
  </tr>\
  <tr>\
      <td width=\"20%\" style=\"border: solid 1px; font-size:0.8em;\">주문자 </td>\
      <td style=\"border: solid 1px; font-size:0.8em;\" colspan=\"3\">김영희 010-1232-4567 <span>(접수:2018년 1월 25일 15시 30분)</span> </td>\
  </tr>\
  <tr>\
      <td width=\"15%\" style=\"border: solid 1px; font-size:0.8em;\">배달자</td>\
      <td style=\"border: solid 1px; font-size:0.8em;\" colspan=\"3\">미정 </td>\
  </tr>\
  <tr>\
    <td style=\"border: solid 1px; font-size:0.8em;\" width=\"100%\" colspan=\"4\">\
      멥떡-가래떡 2kg<br>\
      시루떡-찹쌀 0.5말\
    </td>\
  </tr> \
  <tr>\
    <td style=\"border: solid 1px; font-size:0.8em;\" width=\"100%\" colspan=\"4\">\
      이쁘게 포장해주세요.\
    </td>\
  </tr> \
  </table>";
    } 


    console.log("print--- ")

    let options: PrintOptions = {
        name: 'MyDocument',
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
          console.log("e.url:"+e.url);
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

  swipeCategory(event){
    //console.log("event.direction:"+event.direction);
    if(event.direction == 2){ //Direction left
      console.log("Item swiped left to delete")
      
    }
    else if(event.direction == 4){
      console.log("Item swiped right to modify");
    }
  }

 

  ////////////////////////////////////////////////////////////////////////////////////////
  //////////////////////////                              ////////////////////////////////
  //////////////////////////        DELIVER SECTION       //////////////////////////////// 
  //////////////////////////                              ////////////////////////////////
  ////////////////////////////////////////////////////////////////////////////////////////
  

  deliverManManage(){ //Deliver Personnel Page Navigate
    
  }

  selectDeliveryMan(order){ //When user choose delivery Man with order

    console.log("chosen delivery Man Name: " + JSON.stringify(order.carrier));
  
    let body = {orderid:order.id, carrier:order.carrier};
      this.http.setDataSerializer("json"); 
      this.http.post("https://8ca0a9qq5g.execute-api.ap-northeast-2.amazonaws.com/latest/assignCarrier",body,{"Content-Type":"application/json"}).then((res:any)=>{              
        console.log("res:"+JSON.stringify(res));
        let response=JSON.parse(res.data);
        console.log("response: " + JSON.stringify(response));
        if(response.result=="success"){
          console.log("setting carrier with this order is success: " + JSON.stringify(order.carrier));
        }
    },(err)=>{
        console.log("err:"+JSON.stringify(err));
    });
  }



  selectCategory(){
    console.log("selectCategory:"+this.categorySelected);
    if(this.menus[this.categorySelected].menus.length==1){
          this.dduckName=this.menus[this.categorySelected].menus[0];
    }
  }

  






  ////////////////////////////////////////////////////////////////////////////////////////
  //////////////////////////                              ////////////////////////////////
  //////////////////////////        PRODUCE SECTION       //////////////////////////////// 
  //////////////////////////                              ////////////////////////////////
  ////////////////////////////////////////////////////////////////////////////////////////
  





///// End of HOME.TS /////
}