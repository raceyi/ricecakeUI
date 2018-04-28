import { NavController,AlertController,Platform ,Events} from 'ionic-angular';
import { HttpClient } from '@angular/common/http';
import { Injectable,NgZone } from '@angular/core';
import {ConfigProvider} from "../config/config";
import {ServerProvider} from "../../providers/server/server";
import * as moment from 'moment';

/*
  Generated class for the StorageProvider provider.

  See https://angular.io/guide/dependency-injection for more info on providers
  and Angular DI.
*/
@Injectable()
export class StorageProvider {
  orderList:any=[];
  trashList:any=[];
  carriers=[];
  menus=[];

  deliveryDate;
  deliveyDay;
  ///////////////////
  // deliverySection
    carrierOrder=[];
    assignOrderList=[];
    unassingOrderDeliveryList=[];
    unassingOrderPickupList=[];
    unassingOrderFrozenList=[];
    unassingOrderEtcList=[];
  ///////////////////
  // produceSection
    produceList=[];
    produceTables=[];

  newOrderInputShown:boolean=false;

  //////////////////////////////
  // Menu 편집 화면을 위한 변수-begin
  maxMenuId:number=0;
  categorySelected;
  // Menu 편집 화면을 위한 변수-end
  ///////////////////////////////
  lastOrderUpdateTime;

  constructor(public http: HttpClient,
              public alertCtrl:AlertController, 
              private platform: Platform,  
              public events: Events,                
              public serverProvider:ServerProvider,
              public configProvider:ConfigProvider,
              public ngZone:NgZone) {
    console.log('Hello StorageProvider Provider');
 let menus:any=[
    {"category":"기타","menu":"empty",type:"general",categorySeq:0},   // empty일 경우도 반듯이 categorySeq와 type은 들어가아만 한다!!! DB에 수동입력해주자.
    {"category":"멥떡","menu":"empty",type:"general",categorySeq:1},
    {"category":"백리향1송이","menu":"empty",categorySeq:2},
    {"category":"백리향2송이","menu":"empty",categorySeq:3},
    {"category":"백리향2송이(이티)","menu":"empty",categorySeq:4},
    {"category":"십리향1송이","menu":"empty",categorySeq:5},
    {"category":"십리향2송이","menu":"empty",categorySeq:6},
    {"category":"십리향3송이(이티)","menu":"empty",categorySeq:7},
    {"category":"십리향3송이(흑임자)","menu":"empty",categorySeq:8},
    {"category":"찰떡","menu":"empty",categorySeq:9},
    {"category":"메뉴없음(일반)","menu":"empty",type:"general",categorySeq:10},
    {"category":"메뉴없음(세트)","menu":"empty",type:"complex",categorySeq:11},
    {"category":"메뉴없음(세트-선택)","menu":"empty",type:"complex-choice",categorySeq:12},

    {"category":"기타","menu":"견과류강정","categorySeq":0,"menuSeq":0},
    {"category":"기타","menu":"멥밥","categorySeq":0,"menuSeq":1},
    {"category":"기타","menu":"미숫가루(고품격)","categorySeq":0,"menuSeq":2},
    {"category":"기타","menu":"미숫가루(오곡)","categorySeq":0,"menuSeq":3},
    {"category":"기타","menu":"미숫가루(흑임자)","categorySeq":0,"menuSeq":4},
    {"category":"기타","menu":"수수팥(2색)","categorySeq":0,"menuSeq":5},
    {"category":"기타","menu":"수수팥(카스테라)","categorySeq":0,"menuSeq":6},
    {"category":"기타","menu":"수수팥(팥)","categorySeq":0,"menuSeq":7},
    {"category":"기타","menu":"약과","categorySeq":0,"menuSeq":8},
    {"category":"기타","menu":"오곡밥","categorySeq":0,"menuSeq":9},
    {"category":"기타","menu":"오곡밥(팥만)","categorySeq":0,"menuSeq":10},
    {"category":"멥떡","menu":"가래떡","categorySeq":1,"menuSeq":0},
    {"category":"멥떡","menu":"꿀떡","categorySeq":1,"menuSeq":1},
    {"category":"멥떡","menu":"녹두호박설기","categorySeq":1,"menuSeq":2},
    {"category":"멥떡","menu":"단호박소담","categorySeq":1,"menuSeq":3},
    {"category":"멥떡","menu":"대추편","categorySeq":1,"menuSeq":4},
    {"category":"멥떡","menu":"딸기설기","categorySeq":1,"menuSeq":5},
    {"category":"멥떡","menu":"멥편 (팥)","categorySeq":1,"menuSeq":6},
    {"category":"멥떡","menu":"멥편(기피)","categorySeq":1,"menuSeq":7},
    {"category":"멥떡","menu":"멥편(녹두)","categorySeq":1,"menuSeq":8},
    {"category":"멥떡","menu":"멥편(콩)","categorySeq":1,"menuSeq":9},
    {"category":"멥떡","menu":"무지개설기","categorySeq":1,"menuSeq":10},
    {"category":"멥떡","menu":"미니설기(100)","categorySeq":1,"menuSeq":11},
    {"category":"멥떡","menu":"미니설기(무지)","categorySeq":1,"menuSeq":12},
    {"category":"멥떡","menu":"미니설기(첫돌)","categorySeq":1,"menuSeq":13},
    {"category":"멥떡","menu":"미니설기(하트)","categorySeq":1,"menuSeq":14},
    {"category":"멥떡","menu":"바람떡","categorySeq":1,"menuSeq":15},
    {"category":"멥떡","menu":"밤콩설기","categorySeq":1,"menuSeq":16},
    {"category":"멥떡","menu":"백설기","categorySeq":1,"menuSeq":17},
    {"category":"멥떡","menu":"송편","categorySeq":1,"menuSeq":18},
    {"category":"멥떡","menu":"쑥밤콩설기","categorySeq":1,"menuSeq":19},
    {"category":"멥떡","menu":"잣설기","categorySeq":1,"menuSeq":20},
    {"category":"멥떡","menu":"절편(2색)","categorySeq":1,"menuSeq":21},
    {"category":"멥떡","menu":"절편(쑥)","categorySeq":1,"menuSeq":22},
    {"category":"멥떡","menu":"절편(흰)","categorySeq":1,"menuSeq":23},
    {"category":"멥떡","menu":"초코설기","categorySeq":1,"menuSeq":24},
    {"category":"멥떡","menu":"현미설기","categorySeq":1,"menuSeq":25},
    {"category":"멥떡","menu":"흑임자설기","categorySeq":1,"menuSeq":26},
    {"category":"백리향1송이","menu":"[{\"호박(미니랩)\":3},{\"쑥밤콩(미니랩)\":3},{\"밤콩(미니랩)\":3},{\"고구마호박찰(미니랩)\":3},{\"완두(미니랩)\":3},{\"약식(미니랩)\":3},{\"콩영양(미니랩)\":3},{\"모듬(미니랩)\":3}]","categorySeq":2,"menuSeq":0},
    {"category":"백리향2송이","menu":"[{\"쑥밤콩(미니랩)\":3},{\"호박(미니랩)\":3},{\"모듬(미니랩)\":3},{\"약식(미니랩)\":3},{\"콩영양(미니랩)\":3},{\"완두(미니랩)\":3},{\"딸기(미니랩)\":9},{\"고구마호박찰(미니랩)\":12}]","categorySeq":3,"menuSeq":0},
    {"category":"백리향2송이(이티)","menu":"[{\"고구마호박찰(미니랩)\":12},{\"호박(미니랩)\":3},{\"쑥밤콩(미니랩)\":3},{\"완두(미니랩)\":3},{\"모듬(미니랩)\":3},{\"약식(미니랩)\":3},{\"콩영양(미니랩)\":3}]","categorySeq":4,"menuSeq":0},
    {"category":"십리향1송이","menu":"[{\"완두(기계)\":3},{\"호박(기계)\":3},{\"모듬(기계)\":3}]","categorySeq":5,"menuSeq":0},
   {"category":"십리향2송이","menu":"[{\"완두(기계)\":3},{\"모듬(기계)\":3},{\"밤콩(기계)\":3},{\"쑥밤콩(기계)\":3},{\"약식(기계)\":3},{\"호박(기계)\":3}]","categorySeq":6,"menuSeq":0},
    {"category":"십리향3송이(이티)","menu":"[{\"호박(기계)\":3},{\"모듬(기계)\":3},{\"약식(기계)\":3},{\"쑥밤콩(기계)\":3},{\"밤콩(기계)\":3},{\"완두(기계)\":3}]","categorySeq":7,"menuSeq":0},
    {"category":"십리향3송이(흑임자)","menu":"[{\"완두(기계)\":3},{\"호박(기계)\":3},{\"모듬(기계)\":3},{\"약식(기계)\":3},{\"밤콩(기계)\":3},{\"쑥밤콩(기계)\":3}]","categorySeq":8,"menuSeq":0},
    {"category":"찰떡","menu":"고구마호박찰","categorySeq":9,"menuSeq":0},
    {"category":"찰떡","menu":"기피인절미","categorySeq":9,"menuSeq":1},
    {"category":"찰떡","menu":"기피편","categorySeq":9,"menuSeq":2},
    {"category":"찰떡","menu":"깨편","categorySeq":9,"menuSeq":3},
    {"category":"찰떡","menu":"녹두편","categorySeq":9,"menuSeq":4},
    {"category":"찰떡","menu":"모듬영양","categorySeq":9,"menuSeq":5},
    {"category":"찰떡","menu":"시루떡","categorySeq":9,"menuSeq":6},
    {"category":"찰떡","menu":"쑥인절미","categorySeq":9,"menuSeq":7},
    {"category":"찰떡","menu":"약식","categorySeq":9,"menuSeq":8},
    {"category":"찰떡","menu":"완두시루","categorySeq":9,"menuSeq":9},
    {"category":"찰떡","menu":"이티","categorySeq":9,"menuSeq":10},
    {"category":"찰떡","menu":"콩깨편","categorySeq":9,"menuSeq":11},
    {"category":"찰떡","menu":"콩영양","categorySeq":9,"menuSeq":12},
    {"category":"찰떡","menu":"콩인절미","categorySeq":9,"menuSeq":13},
    {"category":"찰떡","menu":"콩편","categorySeq":9,"menuSeq":14},
    {"category":"찰떡","menu":"함시루","categorySeq":9,"menuSeq":15},
    {"category":"찰떡","menu":"현미모듬","categorySeq":9,"menuSeq":16},
    {"category":"찰떡","menu":"현미쑥인절미","categorySeq":9,"menuSeq":17},
    {"category":"찰떡","menu":"현미인절미","categorySeq":9,"menuSeq":18},
    {"category":"찰떡","menu":"흑임자인절미","categorySeq":9,"menuSeq":19},
  {"category":"찰떡","menu":"흰인절미","categorySeq":9,"menuSeq":20},
        {
            "category": "십리향선택",
            "menu": "[{\"모듬찰떡(기계)\":1},{\"단호박소담(기계)\":1},{\"완두시루떡(기계)\":1}]",
            "choiceNumber":2,
            "categorySeq":10,
            "menuSeq":0
        }
  ];

    this.platform.ready().then(() => {
            this.refresh("menu");
            this.refresh("order");
            this.refresh("carrier");
    });
    var now = new Date().getTime();
    this.setDeliveryDate(now);
    console.log("deliveryDate:" + this.deliveryDate);

    this.serverProvider.event.subscribe((value)=>{
        console.log("event - value:"+value);
    });

    events.subscribe('update', (tablename) => { //It doesn't work. why?
        console.log("storageProvider receive update event "+tablename);        
        this.refresh(tablename);
    });
  }
  
  refresh(tablename:string){ // 서버로 부터 최신 정보를 가져온다.
        return new Promise((resolve,reject)=>{  
            console.log("refresh-"+tablename);
            if(tablename=="carrier"){
                this.serverProvider.getCarriers(this.deliveryDate.substr(0,10)).then((carriers:any)=>{
                    console.log("carriers:"+JSON.stringify(carriers));
                    this.ngZone.run(()=>{
                        this.carriers=carriers;
                        this.reconfigureDeliverySection();
                    });
                    resolve();
                },err=>{
                    let alert = this.alertCtrl.create({
                        title: '배달원 정보를 가져오는데 실패했습니다.',
                        subTitle: '네트웍상태를 확인해주세요.',
                        buttons: ['확인']
                    });
                    alert.present(); 
                    reject();                                   
                })
            }                          
            if(tablename=="menu"){
                this.serverProvider.getMenus().then((menus)=>{
                    this.ngZone.run(()=>{
                        this.convertMenuInfo(menus);
                    });
                    resolve();
                },err=>{
                    let alert = this.alertCtrl.create({
                        title: '메뉴정보를 가져오는데 실패했습니다.',
                        subTitle:'네트웍상태를 확인해주세요.',
                        buttons: ['확인']
                    });
                    alert.present();
                    reject();                       
                })
            }
            if(tablename=="order"){
                this.serverProvider.getOrders(this.deliveryDate.substr(0,10)).then((orders)=>{
                    this.ngZone.run(()=>{
                        this.orderList=orders;
                        this.convertOrderList(this.orderList);
                        this.orderList.sort(function(a,b){
                            let a_delivery=new Date(a.deliveryTime);
                            let b_delivery=new Date(b.deliveryTime);
                            if (a_delivery.getTime() < b_delivery.getTime()) return -1;
                            if (a_delivery.getTime() > b_delivery.getTime()) return 1;
                            return 0;
                        } );
                        let now=new Date();
                        this.lastOrderUpdateTime=now.toString();
                        console.log("call reconfigureDeliverySection...");
                        this.reconfigureDeliverySection();
                        this.configureProduceSection();
                    });                                
                    console.log("orderList.length:"+this.orderList.length);
                    resolve();
                },err=>{
                    let alert = this.alertCtrl.create({
                        title: '주문정보를 가져오는데 실패했습니다.',
                        subTitle: '네트웍상태를 확인해주세요.',
                        buttons: ['확인']
                    });
                    alert.present();                
                    reject();
                });
                this.serverProvider.getOrdersInTrash().then((orders)=>{
                    this.ngZone.run(()=>{
                    this.trashList=orders;
                    this.trashList.sort(function(a,b){
                                if (a.id > b.id) return -1;
                                if (a.id < b.id) return 1;
                                return 0;
                        });
                    this.convertOrderList(this.trashList);
                    });
                },err=>{
                    let alert = this.alertCtrl.create({
                        title: '휴지통 정보를 가져오는데 실패했습니다.',
                        subTitle: '네트웍상태를 확인해주세요.',
                        buttons: ['확인']
                    });
                    alert.present();                
                    reject();                
                })
            }
        });
  }


      getDayInKorean(day) {
        switch (day) {
            case 0: return "일요일";
            case 1: return "월요일";
            case 2: return "화요일";
            case 3: return "수요일";
            case 4: return "목요일";
            case 5: return "금요일";
            case 6: return "토요일";
        }
    };

      setDeliveryDate(milliseconds) {
        var d = new Date(milliseconds);
        var mm = d.getMonth() < 9 ? "0" + (d.getMonth() + 1) : (d.getMonth() + 1); // getMonth() is zero-based
        var dd = d.getDate() < 10 ? "0" + d.getDate() : d.getDate();
        var hh = d.getHours() < 10 ? "0" + d.getHours() : d.getHours();
        var min = d.getMinutes() < 10 ? "0" + d.getMinutes() : d.getMinutes();
        var dString = d.getFullYear() + '-' + (mm) + '-' + dd + 'T' + hh + ":" + min + moment().format("Z");
        this.deliveryDate = dString;
        this.deliveyDay = this.getDayInKorean(d.getDay());
    };

    updateDeliveryDay() {
        var d = new Date(this.deliveryDate);
        this.deliveyDay = this.getDayInKorean(d.getDay());
        this.refresh("order");
        this.newOrderInputShown=false;
    };

    getISOtime(time) {
        var d = new Date(time);
        var sss = d.getMilliseconds();
        var ss = d.getSeconds() < 10 ? "0" + (d.getSeconds()) : (d.getSeconds());
        var mm = d.getMonth() < 9 ? "0" + (d.getMonth() + 1) : (d.getMonth() + 1);
        var dd = d.getDate() < 10 ? "0" + d.getDate() : d.getDate();
        var hh = d.getHours() < 10 ? "0" + d.getHours() : d.getHours();
        var min = d.getMinutes() < 10 ? "0" + d.getMinutes() : d.getMinutes();
        var dString = d.getFullYear() + '-' + (mm) + '-' + (dd) + 'T' + hh + ":" + min + ":" + ss + "." + sss;
        return dString;
    };

    orderGoYesterday() {
        var yesterday = new Date(this.deliveryDate).getTime() - 24 * 60 * 60 * 1000;
        console.log("order move yesterday:" + this.getISOtime(yesterday));
        this.setDeliveryDate(yesterday);
        this.refresh("order").then(()=>{
            this.refresh("carrier")
            this.newOrderInputShown=false;
        },err=>{

        });
    };
    
    orderGoTomorrow() {
        var tomorrow = new Date(this.deliveryDate).getTime() + 24 * 60 * 60 * 1000;
        console.log("order move tomorrow:" + this.getISOtime(tomorrow));
        this.setDeliveryDate(tomorrow);
                this.refresh("order").then(()=>{
            this.refresh("carrier")
            this.newOrderInputShown=false;
        },err=>{

        });
    };

       todayOrders() {
        var today = new Date().getTime();
        console.log("order move tomorrow:" + this.getISOtime(today));
        this.setDeliveryDate(today);
        this.serverProvider.getOrders(this.deliveryDate.substr(0,10)).then((orders)=>{
                this.orderList=orders;
                this.convertOrderList(this.orderList);
                this.orderList.sort(function(a,b){
                    let a_delivery=new Date(a.deliveryTime);
                    let b_delivery=new Date(b.deliveryTime);
                    if (a_delivery.getTime() < b_delivery.getTime()) return -1;
                    if (a_delivery.getTime() > b_delivery.getTime()) return 1;
                    return 0;
                } );
                this.reconfigureDeliverySection();
                this.configureProduceSection(); 
                this.newOrderInputShown=false;               
                console.log("orderList.length:"+this.orderList.length);
        },err=>{

        });
    };

  convertOrderList(orderList){
    orderList.forEach(order=>{
           order.orderedTimeString= order.orderedTime.substr(0,4)+"년"+order.orderedTime.substr(5,2)+"월"+
                                    order.orderedTime.substr(8,2)+"일"+order.orderedTime.substr(11,2)+"시"+ 
                                    order.orderedTime.substr(14,2)+"분";
           console.log(order.orderedTime+"orderedTimeString:"+order.orderedTimeString);
            if(order.paymentMethod=="cash"){

               if(order.payment=="paid-pre"){
                    order.paymentString="현금선불-완납";
               }else if(order.payment=="unpaid-after"){
                    order.paymentString="현금후불";                    
               }else if(order.payment=="paid-after"){
                    order.paymentString="현금후불-완납";                    
               }else if(order.payment=="unpaid-transaction"){ 
                    order.paymentString="현금이체";
               }else if(order.payment=="paid"){
                    order.paymentString="현금이체-완납";
               }else if(order.payment=="unknown"){
                    order.paymentString="현금보류";
               }else if(order.payment=="month"){
                    order.paymentString="월말정산";
               }
           }else if(order.paymentMethod=="card"){ //must be card
               if(order.payment=="paid-pre"){
                    order.paymentString="카드선불";
               }else if(order.payment=="unpaid"){
                    order.paymentString="카드기";
               }else if(order.payment=="paid"){
                   order.paymentString="카드기-완납";
               }
           }
    });
  }

    saveOrder(order){
        return new Promise((resolve,reject)=>{    
            this.serverProvider.saveOrder(order).then(()=>{
                this.refresh("order");
                resolve();
            },(err)=>{
                this.refresh("order");
                reject(err);
            });
        });
    }

    updateOrder(order){
        return new Promise((resolve,reject)=>{            
        this.serverProvider.updateOrder(order).then(()=>{
            this.refresh("order");
            resolve();
        },(err)=>{
            this.refresh("order");
            reject(err);
        });
        });
    }

    deleteOrders(){
        return new Promise((resolve,reject)=>{                    
        this.serverProvider.deleteOrders().then(()=>{
            this.refresh("order");            
            resolve();
        },(err)=>{
            this.refresh("order");
            reject(err);
        });          
        });
    }

    hideOrder(id){
        return new Promise((resolve,reject)=>{                            
        this.serverProvider.hideOrder(id).then(()=>{
            this.refresh("order");            
            resolve();
        },(err)=>{
            this.refresh("order");
            reject(err);
        });          
        })
    }

    showOrder(id){
        return new Promise((resolve,reject)=>{                                    
        this.serverProvider.showOrder(id).then(()=>{
            this.refresh("order");            
            resolve();    
        },(err)=>{
            this.refresh("order");
            reject(err);
        });          
        });
    }
    
    assignCarrier(orderid,carrier){
        return new Promise((resolve,reject)=>{                                            
        this.serverProvider.assignCarrier(orderid,carrier).then(()=>{
           this.refresh("carrier");            
           resolve(); 
        },(err)=>{
            this.refresh("carrier");
            reject(err);
        });   
        });
    }
    
    addCarrier(name){
        return new Promise((resolve,reject)=>{                                            
        this.serverProvider.addCarrier(name,this.deliveryDate.substr(0,10)).then(()=>{
           this.refresh("carrier");            
           resolve(); 
        },(err)=>{
            this.refresh("carrier");
            reject(err);
        });   
        });
    }

    deleteCarrier(name){
        return new Promise((resolve,reject)=>{                                            
        this.serverProvider.deleteCarrier(name,this.deliveryDate.substr(0,10)).then(()=>{
            this.refresh("carrier");            
            resolve(); 
        },(err)=>{
            this.refresh("carrier");
            reject(err);
        });   
        });
    }

    reconfigureDeliverySection(){
        console.log("reconfigureDeliverySection-begin");

        this.assignOrderList = []; 
        this.unassingOrderDeliveryList = []; //배달:delivery,픽업:pickup,냉동:frozen,기타:etc
        this.unassingOrderPickupList = [];
        this.unassingOrderFrozenList = [];
        this.unassingOrderEtcList = [];

        this.carriers.forEach((carrier) =>{
            this.assignOrderList.push({ name: carrier.name, orders: [] });
        });
        console.log("assignOrderList-"+JSON.stringify(this.assignOrderList));
        this.orderList.forEach((order)=> {
            if (order.carrier) {
                console.log("order.carrier:" + order.carrier);
                var index = this.assignOrderList.findIndex(function (carrier) {
                    if (order.carrier == carrier.name) {
                        return true;
                    }
                    return false;
                });
                console.log("hum... please check error -1")
                if(index!=-1)
                        this.assignOrderList[index].orders.push(order);
                console.log("hum... please check error -2")
            }
            else {
                if (order.deliveryMethod == "배달")
                    this.unassingOrderDeliveryList.push(order);
                else if (order.deliveryMethod == "픽업")
                    this.unassingOrderPickupList.push(order);
                else if (order.deliveryMethod == "냉동")
                    this.unassingOrderFrozenList.push(order);
                else if (order.deliveryMethod == "기타")
                    this.unassingOrderEtcList.push(order);
            }
        });
        this.assignOrderList.sort(function(a,b){
            if(a.name <b.name)
                  return -1;
            if(a.name>b.name)
                  return 1;
            return 0;           
        })

        console.log("this.assignOrderList-end:" + JSON.stringify(this.assignOrderList));
    }

    /////////////////////////////////////////////////////////
    //   Produce section - begin
    addMenuInList(menu, deliveryTime, amount,customerMenu) {
        console.log("menu.menu:" + JSON.stringify(menu.menu));
        var hhmm = deliveryTime.slice(11, 13) + "시 " + deliveryTime.slice(14, 16) + "분";
        var min = parseInt(deliveryTime.slice(11, 13)) * 60 + parseInt(deliveryTime.slice(14, 16));
        if(customerMenu){
            let index = this.produceList.findIndex(function (val) {
                console.log("val.menu:" + JSON.stringify(val));
                if (val.menu == "직접입력")
                    return true;
                else
                    return false;
            });
            console.log("index:" + index);
            if (index < 0) {
                console.log
                this.produceList.push({ menu: "직접입력", amount: [{ amount: amount + menu.unit, time: hhmm, min: min ,menu: menu.menu}] });
            }
            else {
                this.produceList[index].amount.push({ amount: amount + menu.unit, time: hhmm, min: min,menu:menu.menu });
            }
            console.log("produceList:" + JSON.stringify(this.produceList));            
        }else{
            let index = this.produceList.findIndex(function (val) {
                console.log("val.menu:" + JSON.stringify(val));
                if (val.menu == menu.menu)
                    return true;
                else
                    return false;
            });
            console.log("index:" + index);
            if (index < 0) {
                console.log
                this.produceList.push({ menu: menu.menu, amount: [{ amount: amount + menu.unit, time: hhmm, min: min ,unit:menu.unit,amountNum:amount}] });
            }
            else {
                this.produceList[index].amount.push({ amount: amount + menu.unit, time: hhmm, min: min ,unit:menu.unit,amountNum:amount});
            }
            console.log("produceList:" + JSON.stringify(this.produceList));
        }
    };

    configureProduceSection() {
        this.produceList = []; //[{menu:"단호박소담",amount:[{amount:"1kg",time:"03:00"}]}]
        this.orderList.forEach( (order)=> {
            order.menuList.forEach( (menu) =>{
                console.log("produceSection- menu:"+JSON.stringify(menu));
                if(menu.category=="직접입력"){
                    this.addMenuInList(menu, order.deliveryTime, menu.amount,true);
                }else if (menu.menu.indexOf("[") == 0) {
                    var menuObjs = JSON.parse(menu.menu);
                    menuObjs.forEach( (menuObj)=> {
                        var key :any= Object.keys(menuObj);
                        var menuInput = { menu: key[0], unit: menu.unit };
                        var amount = Number(menuObj[key]) * Number(menu.amount);
                        console.log("amount:" + amount);
                        this.addMenuInList(menuInput, order.deliveryTime, amount,false);
                    });
                }
                else {
                    this.addMenuInList(menu, order.deliveryTime, menu.amount,false);
                }
            });
        });
        console.log("produceList:" + JSON.stringify(this.produceList));
        //humm sort each menu with deliveryTime(?)   
        this.produceList.forEach((menu) =>{
            menu.amount.sort(function (a, b) {
                if (a.min < b.min)
                    return -1;
                if (a.min > b.min)
                    return 1;
                return 0;
            });
            let kg=0;
            let mal=0;
            let doi=0;
            let jyupsi=0;
            let gae=0;
            menu.amount.forEach(amount=>{
                if(amount.unit=='kg'){
                    if(Number(amount.amountNum)!=NaN)
                        kg+=Number(amount.amountNum);
                }else if(amount.unit =='말'){
                    if(Number(amount.amountNum)!=NaN)
                        mal+=Number(amount.amountNum);
                }else if( amount.unit=='되'){
                    if(Number(amount.amountNum)!=NaN)
                        doi+=Number(amount.amountNum);
                }else if( amount.unit=='접시'){
                    if(Number(amount.amountNum)!=NaN)
                        jyupsi+=Number(amount.amountNum);
                }else if( amount.unit=='개'){
                    if(Number(amount.amountNum)!=NaN)
                        gae+=Number(amount.amountNum);
                }
            })
            menu.kg=kg;
            menu.mal=mal;
            menu.doi=doi;
            menu.jyupsi=jyupsi;
            menu.gae=gae;
        });
        this.produceList.sort(function(a,b){
            if(a.menu=="직접입력" && b.menu=="직접입력")
                  return 0;
            if(a.menu=="직접입력")
                  return 1;
            if(b.menu=="직접입력")
                  return -1;
            if(a.menu <b.menu)
                  return -1;
            if(a.menu>b.menu)
                  return 1;
            return 0;           
        })

        if(this.produceList.length==0)
            return;

        // humm... produceList의 각 메뉴별 합을 구한다. 이건 쉽다.
        this.produceTables=[];
        let table={menus:[]}

        table.menus.push(this.produceList[0]);
        let prefix=this.getPrefix(this.produceList[0].menu);
        console.log("prefix:"+prefix);          
        for(let i=1;i< this.produceList.length;i++){
            let nextPrefix=this.getPrefix(this.produceList[i].menu);  
            console.log("nextPrefix:"+nextPrefix);          
            if(nextPrefix==prefix){
                  table.menus.push(this.produceList[i]);  
            }else{
                  this.produceTables.push(table);
                  table={menus:[]};
                  prefix=nextPrefix;
                  table.menus.push(this.produceList[i]);
                  this.produceList[i-1].delimeter=true;
            }            
        }
        this.produceTables.push(table);
        console.log("this.produceTables:"+JSON.stringify(this.produceTables));        
    };

   getPrefix(menu){
        let prefix;

        if(menu.indexOf('(')>=0){
            let splits=menu.split('(');   
            prefix=splits[0];
        }else
            prefix=menu;
        return prefix;
   }

   /////////////////////////////////////////////////////
   // 메뉴 수정 -begin
  convertMenuInfo(menus){
      let categories=[]; 
      menus.forEach(menu=>{
          if(categories.findIndex(function(value){
                return menu.category==value.category;
             })==-1){
               if(menu.type)
                  categories.push({category:menu.category, categorySeq:menu.categorySeq,type:menu.type});
               else 
                  categories.push({category:menu.category, categorySeq:menu.categorySeq});
          }
      })
      console.log("categories:"+JSON.stringify(categories));

      categories.sort(function(a,b){
          if(a.categorySeq<b.categorySeq)
              return -1;
          if(a.categorySeq>b.categorySeq)
              return 1;
          return 0;                
      });
      console.log("menus.sort:"+JSON.stringify(menus));


      let menuInfos=[];
      categories.forEach(category=>{
          let type;
          if(category.type)
            type=category.type;
          else
            type="general";
          menuInfos.push({type:type,category:category.category, id: "category_"+category.category, categorySeq:category.categorySeq,ids:[],menus:[],optionStrings:[]});
      })
       
        menus.forEach(menu=>{
          if(menu.menu!="empty"){
             let menuString=menu.menu;
             let type="general";
             let categoryIndex=categories.findIndex(function(value){
                  if(menu.category==value.category)
                    return true;
                  return false;  
             })
             if(menu.hasOwnProperty("choiceNumber") && menu.choiceNumber>0){
                    type="complex-choice";
                    let menuObjs=JSON.parse(menu.menu);
                    console.log("menuObj:"+JSON.stringify(menuObjs));
                    let index=0;
                    menuObjs.forEach(menuObj=>{
                        //let menuString="";
                        let key:any=Object.keys(menuObj);
                        menuString+=key+menuObj[key]+" ";
                        //menuInfos[categoryIndex].optionStrings.push(menuString); 
                        ++index;
                    });
                    menuString= menu.choiceNumber+"개 선택";
                    let menuClone = Object.assign({}, menu);
                    menuClone.menuString=menuString;
                    menuInfos[categoryIndex].menus.push(menuClone);
                    menuInfos[categoryIndex].choiceNumber=menu.choiceNumber;
                    menuInfos[categoryIndex].type=type;
             }else if(menu.menu.indexOf("[")==0){ 
                        type="complex";  
                        let menuObjs=JSON.parse(menu.menu);
                        console.log("menuObj:"+JSON.stringify(menuObjs));
                        menuString="";
                        menuObjs.forEach(menuObj=>{
                        let key:any=Object.keys(menuObj);
                        menuString+=key+menuObj[key]+" ";
                    });
                    let menuClone = Object.assign({}, menu);
                    menuClone.menuString=menuString;                    
                    menuInfos[categoryIndex].type=type;
                    menuInfos[categoryIndex].menus.push(menuClone);
                    menuInfos[categoryIndex].optionStrings.push(menuString); 
             }else{
                    let menuClone = Object.assign({}, menu);
                    menuClone.menuString=menuString;                 
                    menuInfos[categoryIndex].ids.push("menu_"+this.maxMenuId++);
                    menuInfos[categoryIndex].menus.push(menuClone);
                    menuInfos[categoryIndex].optionStrings.push(menuString); 
                    //console.log("!!!menuids: "+JSON.stringify(menuInfos[categoryIndex]));
             }
          }else{//"empty"
             let categoryIndex=categories.findIndex(function(value){
                  if(menu.category==value.category)
                    return true;
                  return false;  
             })
              menuInfos[categoryIndex].deactive = menu.deactive;
          }
        })     
        
        menuInfos.forEach(category=>{
          category.menus.sort(function(a,b){
              if(a.menuSeq<b.menuSeq)
                  return -1;
              if(a.menuSeq>b.menuSeq)
                  return 1;
              return 0;   
            });
           // menuString도 변경되어야 한다. 순서에 영향받는 General에 대해서만 변경해주면 된다. 
           category.optionStrings=[];
           category.menus.forEach(menu=>{
              category.optionStrings.push(menu.menu);
           });
        });

       // 카테고리 정렬. 왜 두번해야 할까?
        menuInfos.sort(function(a,b){
           if(a.categorySeq<b.categorySeq)
              return -1;
          if(a.categorySeq>b.categorySeq)
              return 1;
          return 0;                
        });

      if(!this.categorySelected && categories.length>0)
          this.categorySelected=categories[0].category;

        this.menus = menuInfos;
        console.log("menus: " + JSON.stringify(this.menus));
        this.events.publish('updated','menu');
  }

  removeGeneralMenu(reqbody){
        return new Promise((resolve,reject)=>{   
             this.serverProvider.post("removeMenu",reqbody).then((res:any)=>{
              if(res.result=="success"){
                  this.convertMenuInfo(res.menus);
                  resolve();
              }else{
                  if(res.error)
                      reject(res.error);
                  else 
                      reject("failure");   
              }
          },err=>{
              reject(err);
          })         
        });
  }

  addGeneralMenu(reqbody){
        return new Promise((resolve,reject)=>{   
             this.serverProvider.post("addMenu",reqbody).then((res:any)=>{
              if(res.result=="success"){
                  this.convertMenuInfo(res.menus);
                  resolve();
              }else{
                  if(res.error)
                      reject(res.error);
                  else 
                      reject("failure");   
              }
          },err=>{
              reject(err);
          })         
        });
  }

  addComplexMenu(reqbody){
        return new Promise((resolve,reject)=>{   
             this.serverProvider.post("addComplexMenu",reqbody).then((res:any)=>{
              if(res.result=="success"){
                  this.convertMenuInfo(res.menus);
                  resolve();
              }else{
                  if(res.error)
                      reject(res.error);
                  else 
                      reject("failure");   
              }
          },err=>{
              reject(err);
          })         
        });
  }
  
  removeCategory(reqbody){
        return new Promise((resolve,reject)=>{   
         this.serverProvider.post("removeCategory",reqbody).then((res:any)=>{
              if(res.result=="success"){
                  this.convertMenuInfo(res.menus);
                  resolve();
              }else{
                  if(res.error)
                      reject(res.error);
                  else 
                      reject("failure");   
              }
          },err=>{
              reject(err);
          })        
        });    
  }

  addCategory(reqbody){
        return new Promise((resolve,reject)=>{   
          this.serverProvider.post("addCategory",reqbody).then((res:any)=>{
              if(res.result=="success"){
                  this.convertMenuInfo(res.menus);
                  resolve();
              }else{
                  if(res.error)
                      reject(res.error);
                  else 
                      reject("failure");   
              }
          },err=>{
              reject(err);
          })          
        });    
  }

 changeSequence(reqbody){
        return new Promise((resolve,reject)=>{   
          this.serverProvider.post("changeSequence",reqbody).then((res:any)=>{
              console.log("res:"+JSON.stringify(res));
              if(res.result=="success"){
                  this.convertMenuInfo(res.menus);
                  resolve();
              }else{
                  if(res.error)
                      reject(res.error);
                  else 
                      reject("failure");    
              }
          },err=>{
              reject(err);
          })          
        });       
 }

  deactivateMenu(reqbody){
        return new Promise((resolve,reject)=>{   
             this.serverProvider.post("deactivateMenu",reqbody).then((res:any)=>{
              if(res.result=="success"){
                  this.convertMenuInfo(res.menus);
                  resolve();
              }else{
                  if(res.error)
                      reject(res.error);
                  else 
                      reject("failure");   
              }
          },err=>{
              reject(err);
          })         
        });      
  }
// 메뉴 수정 -end
/////////////////////////////////////////////////////

}
