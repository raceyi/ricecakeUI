import { NavController,AlertController,Platform ,Events,App} from 'ionic-angular';
import { HttpClient } from '@angular/common/http';
import { Injectable,NgZone } from '@angular/core';
import {ConfigProvider} from "../config/config";
import {ServerProvider} from "../../providers/server/server";
import * as moment from 'moment';
import { Printer, PrintOptions } from '@ionic-native/printer'
import { NativeStorage } from '@ionic-native/native-storage';
import {InstallPasswordPage} from '../../pages/install-password/install-password';

var gStorageProvider;
/*
  Generated class for the StorageProvider provider.

  See https://angular.io/guide/dependency-injection for more info on providers
  and Angular DI.
*/
@Injectable()
export class StorageProvider {
  sortType="input";
  lastOrderUpdateTime;

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
  /////////////////////
  // set section
  setTable=[];

  newOrderInputShown:boolean=false;

  //////////////////////////////
  // Menu 편집 화면을 위한 변수-begin
  maxMenuId:number=0;
  categorySelected;
  // Menu 편집 화면을 위한 변수-end
  ///////////////////////////////
  ipad;

  //////////////////////////////
  // orderList.sort의 종류

  constructor(public http: HttpClient,
              public alertCtrl:AlertController, 
              private platform: Platform,  
              public events: Events, 
              private printer: Printer,                               
              public serverProvider:ServerProvider,
              public configProvider:ConfigProvider,
              private nativeStorage: NativeStorage,
              private app:App,
              public ngZone:NgZone) {
    console.log('Hello StorageProvider Provider');
    gStorageProvider=this;
    this.ipad=this.platform.is('ipad');

    this.platform.ready().then(() => {
            this.refresh("menu");
            this.refresh("order");
            this.refresh("carrier");

            this.printer.isAvailable().then((avail)=>{
                console.log("avail:"+avail);
                this.printer.check().then((output)=>{
                    console.log("output:"+JSON.stringify(output));
                },err=>{
                        let alert = this.alertCtrl.create({
                            title: '출력기능에 문제가 발생하였습니다.',
                            buttons: ['확인']
                        });
                        alert.present();
                });
            }, (err)=>{
                console.log("err:"+JSON.stringify(err));
                        let alert = this.alertCtrl.create({
                            title: '출력기능에 문제가 발생하였습니다.',
                            buttons: ['확인']
                        });
                        alert.present();            
            });
            if(this.platform.is('android')){
                this.nativeStorage.getItem('install').then(
                    data => {
                        console.log(data)
                    },error =>{ 
                        //this.app.getRootNavs()[0].push(InstallPasswordPage);
                        this.app.getRootNavs()[0].setRoot(InstallPasswordPage);
                        // 처음 설치함.
                        // 설치 비번화면으로 이동해야함.
                        // 설치 비번화면에서 실패시 계속 설치 비번화면
                        // 설치 비번화면에서 성공시 이전 화면으로 돌아옴 
                        console.error(error)
                    }
                );
            }            

            
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
                    console.log("orders:!!!!!"+JSON.stringify(orders)+"!!!!");

                    this.ngZone.run(()=>{
                        this.orderList=orders;
                        this.convertOrderList(this.orderList);
                        if(this.sortType=="delivery"){
                            this.orderList.sort(function(a,b){
                                let a_delivery=new Date(a.deliveryTime);
                                let b_delivery=new Date(b.deliveryTime);
                                if (a_delivery.getTime() < b_delivery.getTime()) return -1;
                                if (a_delivery.getTime() > b_delivery.getTime()) return 1;
                                return 0;
                            } );
                        }else{ //"input""
                            this.orderList.sort(function(a,b){
                                if (a.id < b.id) return -1;
                                if (a.id > b.id) return 1;
                                return 0;
                            } );
                        }
                        let now=new Date();
                        this.lastOrderUpdateTime=now.toString();
                        console.log("call reconfigureDeliverySection...");
                        this.reconfigureDeliverySection();
                        this.configureProduceSection();
                        this.configureSetSection();
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
        this.refresh("carrier");
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
                if(this.sortType=="delivery"){
                            this.orderList.sort(function(a,b){
                                let a_delivery=new Date(a.deliveryTime);
                                let b_delivery=new Date(b.deliveryTime);
                                if (a_delivery.getTime() < b_delivery.getTime()) return -1;
                                if (a_delivery.getTime() > b_delivery.getTime()) return 1;
                                return 0;
                            } );
                }else{ //"input""
                            this.orderList.sort(function(a,b){
                                if (a.id < b.id) return -1;
                                if (a.id > b.id) return 1;
                                return 0;
                            } );
                }
                this.reconfigureDeliverySection();
                this.configureProduceSection(); 
                this.configureSetSection();
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
                else
                        this.unassingOrderDeliveryList.push(order);        
                console.log("hum... please check error -2")
            }else {
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
        //////////////////////////////////////////////////////////////////
        this.assignOrderList.forEach(orderList=>{
            orderList.orders.sort(function(a,b){
                let a_delivery=new Date(a.deliveryTime);
                let b_delivery=new Date(b.deliveryTime);
                if (a_delivery.getTime() < b_delivery.getTime()) return -1;
                if (a_delivery.getTime() > b_delivery.getTime()) return 1;
                return 0;
            })
        });
        this.unassingOrderDeliveryList.sort(function(a,b){
                let a_delivery=new Date(a.deliveryTime);
                let b_delivery=new Date(b.deliveryTime);
                if (a_delivery.getTime() < b_delivery.getTime()) return -1;
                if (a_delivery.getTime() > b_delivery.getTime()) return 1;
                return 0;
        })

        this.unassingOrderPickupList.sort(function(a,b){
                let a_delivery=new Date(a.deliveryTime);
                let b_delivery=new Date(b.deliveryTime);
                if (a_delivery.getTime() < b_delivery.getTime()) return -1;
                if (a_delivery.getTime() > b_delivery.getTime()) return 1;
                return 0;
        })
        this.unassingOrderFrozenList.sort(function(a,b){
                let a_delivery=new Date(a.deliveryTime);
                let b_delivery=new Date(b.deliveryTime);
                if (a_delivery.getTime() < b_delivery.getTime()) return -1;
                if (a_delivery.getTime() > b_delivery.getTime()) return 1;
                return 0;
        })
        this.unassingOrderEtcList.sort(function(a,b){
                let a_delivery=new Date(a.deliveryTime);
                let b_delivery=new Date(b.deliveryTime);
                if (a_delivery.getTime() < b_delivery.getTime()) return -1;
                if (a_delivery.getTime() > b_delivery.getTime()) return 1;
                return 0;
        })
        //////////////////////////////////////////////////////////////////
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
    addMenuInList(menu, deliveryTime,deliveryTimeEnd, amount,customerMenu) {
        if(!deliveryTimeEnd) // deliveryTimeEnd가 없는 경우 오류 방지를 위해 설정함.
            deliveryTimeEnd=deliveryTime;
        console.log("menu.menu:" + JSON.stringify(menu.menu));
        var hhmm = deliveryTime.slice(11, 13) + "시 " + deliveryTime.slice(14, 16) + "분";
        var min = parseInt(deliveryTime.slice(11, 13)) * 60 + parseInt(deliveryTime.slice(14, 16));
        var endhhmm=deliveryTimeEnd.slice(11, 13) + "시 " + deliveryTimeEnd.slice(14, 16) + "분";
        
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
                this.produceList.push({ menu: "직접입력", amount: [{ amount: amount + menu.unit, time: hhmm, timeEnd:endhhmm, min: min ,menu: menu.menu}] });
            }
            else {
                this.produceList[index].amount.push({ amount: amount + menu.unit, time: hhmm, timeEnd:endhhmm, min: min,menu:menu.menu });
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
                this.produceList.push({ menu: menu.menu, amount: [{ amount: amount + menu.unit, time: hhmm, timeEnd:endhhmm, min: min ,unit:menu.unit,amountNum:amount}] });
            }
            else {
                this.produceList[index].amount.push({ amount: amount + menu.unit, time: hhmm, timeEnd:endhhmm,min: min ,unit:menu.unit,amountNum:amount});
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
                    this.addMenuInList(menu, order.deliveryTime, order.deliveryTimeEnd,menu.amount,true);
                }else if (menu.menu.indexOf("[") == 0) {
                    var menuObjs = JSON.parse(menu.menu);
                    menuObjs.forEach( (menuObj)=> {
                        var key :any= Object.keys(menuObj);
                        var menuInput = { menu: key[0], unit: menu.unit };
                        var amount = Number(menuObj[key]) * Number(menu.amount);
                        console.log("amount:" + amount);
                        this.addMenuInList(menuInput, order.deliveryTime,order.deliveryTimeEnd, amount,false);
                    });
                }
                else {
                    this.addMenuInList(menu, order.deliveryTime, order.deliveryTimeEnd,menu.amount,false);
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
  searchKeyWord;
  filter=[];

    lookForMenu(keyword){
        let output=[];
        console.log("lookForMenu:"+keyword);
        this.orderList.forEach(order=>{
            order.menuList.forEach(menu=>{
                console.log("menu:"+JSON.stringify(menu));
                    //if (menu.menu.indexOf("[") == 0) {
                    if(menu.type=="complex-choice"){    
                        var menuObjs = JSON.parse(menu.menu);
                        menuObjs.forEach(function (menuObj) {
                            var key :any= Object.keys(menuObj);
                            if(key[0].indexOf(keyword)>=0){
                                output.push(order);
                            }
                        });
                        if(menu.category.indexOf(keyword)>=0){
                            output.push(order);
                        }
                    }else if(menu.type=="complex"){
                        if(menu.category.indexOf(keyword)>=0){
                            output.push(order);
                        }
                    }else{
                        if(menu.menu.indexOf(keyword)>=0){
                                output.push(order);
                        }
                    }
            });
        });
        return output;
    }

    inputSearchKeyWord(){
        console.log("inputSearchKeyWord:"+this.searchKeyWord);

        if(!this.searchKeyWord) return;

        var searchKeyWord = this.searchKeyWord.trim();
        if ('0' <= searchKeyWord[0] && searchKeyWord[0] <= '9') {
            this.searchKeyWord = this.autoHypenPhone(searchKeyWord); // look for phone number
        }

        this.filter=this.orderList.filter(function(value){
            if('0'<=gStorageProvider.searchKeyWord[0] && gStorageProvider.searchKeyWord[0]<='9'){ //check digit
                    console.log(" "+value.buyerPhoneNumber+" "+gStorageProvider.searchKeyWord);
                    console.log(value.buyerPhoneNumber.startsWith(gStorageProvider.searchKeyWord));
                    return value.buyerPhoneNumber.startsWith(gStorageProvider.searchKeyWord);
            }else{
                    console.log(" "+value.buyerName+" "+gStorageProvider.searchKeyWord); 
                    console.log(value.buyerName.startsWith(gStorageProvider.searchKeyWord)); 
                    return value.buyerName.startsWith(gStorageProvider.searchKeyWord);                
            }
        });
        if(this.filter.length==0){
            //메뉴에서 검색
             this.filter=this.lookForMenu(this.searchKeyWord);
        } 
    }

    autoHypenPhone(str) {
        str = str.replace(/[^0-9]/g, '');
        var tmp = '';
        if (str.length >= 2 && str.startsWith('02')) {
            tmp += str.substr(0, 2);
            tmp += '-';
            if (str.length < 7) {
                tmp += str.substr(2);
            }
            else {
                tmp += str.substr(2, 3);
                tmp += '-';
                tmp += str.substr(5);
            }
            return tmp;
        }
        else if (str.length < 4) {
            return str;
        }
        else if (str.length < 7) {
            tmp += str.substr(0, 3);
            tmp += '-';
            tmp += str.substr(3);
            return tmp;
        }
        else if (str.length < 11) {
            tmp += str.substr(0, 3);
            tmp += '-';
            tmp += str.substr(3, 3);
            tmp += '-';
            tmp += str.substr(6);
            return tmp;
        }
        else {
            tmp += str.substr(0, 3);
            tmp += '-';
            tmp += str.substr(3, 4);
            tmp += '-';
            tmp += str.substr(7);
            return tmp;
        }
    };

  sortOrdersDeliveryTime(){
      this.sortType="delivery";
      this.orderList.sort(function(a,b){
          let a_delivery=new Date(a.deliveryTime);
          let b_delivery=new Date(b.deliveryTime);
          if (a_delivery.getTime() < b_delivery.getTime()) return -1;
          if (a_delivery.getTime() > b_delivery.getTime()) return 1;
          return 0;
      } );
  }

  sortOrdersInputTime(){
      this.sortType="input";
      this.orderList.sort(function(a,b){
          if (a.id < b.id) return -1;
          if (a.id > b.id) return 1;
          return 0;
      } );
  }

    savePayment(order){
        console.log("savePayment-order:"+JSON.stringify(order));
        if(order.paymentMethod=="cash"){
            order.payment="paid-after";
        }else if(order.paymentMethod=="card"){
            order.payment="paid"; 
        }         
        this.updateOrder(order).then(()=>{///
            },err=>{
                console.log("err:"+JSON.stringify(err));
                if(typeof err==="string" && err.indexOf("SMS-")>=0){
                    let alert = this.alertCtrl.create({
                        title: '문자발송에 실패했습니다.',
                        buttons: ['확인']
                    });
                    if(order.paymentMethod=="cash"){
                        order.payment="paid-after";
                    }else if(order.paymentMethod=="card"){
                        order.payment="paid"; 
                    }                     
                    alert.present();
                }else if(typeof err==="string" ){
                    let alert = this.alertCtrl.create({
                        title: '주문 수정에 실패했습니다.',
                        subTitle:err,
                        buttons: ['확인']
                    });
                    alert.present();

                }else{
                    let alert = this.alertCtrl.create({
                        title: '주문 수정에 실패했습니다.',
                        subTitle:JSON.stringify(err),
                        buttons: ['확인']
                    });
                    alert.present();
                }
         });
    }

    saveOrderInput (order, existing) {
        console.log("saveOrder-output:" + JSON.stringify(order));
        if (order == undefined && existing == undefined) {
            console.log("cancel order creation");
            this.newOrderInputShown = false;
            return;
        }else if (order == undefined && existing) {
            console.log("cancel order modification");
            existing.modification = false;
            return;
        }

        if (order.id == undefined) {
            console.log("order creation " + JSON.stringify(order));
            //save order in DB by calling server API. 
            this.saveOrder(order).then(()=>{///
                this.newOrderInputShown = false;
            },err=>{
                console.log("err:"+JSON.stringify(err));
                if(typeof err==="string" && err.indexOf("SMS-")>=0){
                    let alert = this.alertCtrl.create({
                        title: '문자발송에 실패했습니다.',
                        buttons: ['확인']
                    });
                    alert.present();
                    this.newOrderInputShown=false;
                }else if(typeof err==="string" ){
                    let alert = this.alertCtrl.create({
                        title: '주문 생성에 실패했습니다.',
                        subTitle:err,
                        buttons: ['확인']
                    });
                    alert.present();

                }else{
                    let alert = this.alertCtrl.create({
                        title: '주문 생성에 실패했습니다.',
                        subTitle:JSON.stringify(err),
                        buttons: ['확인']
                    });
                    alert.present();
                }
            });
        }
        else {
            // please update DB here
            console.log("order modification");
            //update order List in DB by calling server API.
            let alert = this.alertCtrl.create({
                title:  "문자를 재발송하시겠습니까?",
                buttons: [
                        {
                        text: '아니오',
                        handler: () => {
                            order.sms=false;
                            this.updateOrdrFunc(order,existing);
                            return;
                        }
                        },
                        {
                        text: '네',
                        handler: () => {
                            console.log('agree clicked');
                            order.sms=true;
                            this.updateOrdrFunc(order,existing);
                        }
                        }]
            });
            alert.present();       
        }
    };

    updateOrdrFunc(order, existing){
        this.updateOrder(order).then(()=>{///
                    existing.modification = false;
                    if(order.diffDate){
                            let alert = this.alertCtrl.create({
                                title:  order.deliveryTime.substr(0,10)+'일 화면을 확인하시겠습니까?',
                                buttons: [
                                        {
                                        text: '아니오',
                                        handler: () => {
                                            return;
                                        }
                                        },
                                        {
                                        text: '네',
                                        handler: () => {
                                            console.log('agree clicked');
                                            //배달일 수정하기
                                            this.setDeliveryDate(order.deliveryTime);
                                            this.refresh("order");
                                            return;
                                        }
                                        }]
                            });
                            alert.present();                                    
                    }   
            },err=>{
                if(typeof err==="string" && err.indexOf("SMS-")>=0){
                    existing.modification = false;
                    if(order.diffDate){
                            let alert = this.alertCtrl.create({
                                title:  order.deliveryTime.substr(0,10)+'으로 화면의 배달일을 이동하시겠습니까?',
                                subTitle:"문자발송에 실패했습니다",
                                buttons: [
                                        {
                                        text: '아니오',
                                        handler: () => {
                                            return;
                                        }
                                        },
                                        {
                                        text: '네',
                                        handler: () => {
                                            console.log('agree clicked');
                                            //배달일 수정하기
                                            this.setDeliveryDate(order.deliveryTime);
                                            this.refresh("order");
                                            return;
                                        }
                                        }]
                            });
                            alert.present();                                    
                    }else{
                        let alert = this.alertCtrl.create({
                            title: '문자발송에 실패했습니다.',
                            buttons: ['확인']
                        });
                        alert.present();
                    }
                }else if(typeof err==="string" ){
                    let alert = this.alertCtrl.create({
                        title: '주문 변경에 실패했습니다.',
                        subTitle:err,
                        buttons: ['확인']
                    });
                    alert.present();
                }else{
                    let alert = this.alertCtrl.create({
                        title: '주문 변경에 실패했습니다.',
                        subTitle:JSON.stringify(err),
                        buttons: ['확인']
                    });
                    alert.present();
                }
            });
   }


    refreshWhole(){
        console.log("refresh come");
        this.refresh("order");
        this.refresh("menu");
        this.refresh("carrier");
    }

    print(type){
        let page;
        if(type == 'order'){
            page=this.constructOrderPrint();
        }else if(type == 'delivery'){
            page=this.constructDeliveryPrint();
        }else if(type == 'produce'){
            console.log("produce print");
            page=this.constructProducePrint();
        }else if(type =='set'){
            console.log("produce set");
            page=this.constructSetPrint();            
        }
        let options: PrintOptions = {
            name: 'MyDocument',
            duplex: false,
            landscape: false,
            grayscale: true
        };

        this.printer.print(page, options).then((output)=>{
            console.log("print-output:"+JSON.stringify(output));
        },(err)=>{
            console.log("err:"+JSON.stringify(err));
        });

    }

    constructSetPrint(){
        let rightCharacters:number=22;
        let leftCharacters:number=13;
        let linesPerPage=25; 
        let title=this.deliveryDate.substr(0,4)+"년"+
                      this.deliveryDate.substr(5,2)+"월"+
                      this.deliveryDate.substr(8,2)+"일"+this.deliveyDay;
        let currentPage=1;
        let currentLines=0;
        let eachItems=[];
        let totalLinesNumber=0;
        console.log("constructSetPrint");

        this.setTable.forEach(menu=>{
            let index;
            for(index=0;index<menu.orders.length;index++){
                let order=menu.orders[index];
                let deliveryTime= order.hhmm+'-'+order.hhmmEnd;
                let line;
                let lineNumber=0;
                console.log("lineNumber is "+lineNumber);
                if(order.option)
                    line=order.name+order.option+'-<b>'+order.amount+'개</b>'; //right
                else 
                    line=order.name+'-<b>'+order.amount+'개</b>'; //right
                
                let remain=line.length;
                while(remain>=rightCharacters){
                    console.log("remain:"+remain+" lineNumber:"+lineNumber);
                    remain=remain-rightCharacters;
                    ++lineNumber;
                }
                if(remain>0){
                    console.log("remain:"+remain+" lineNumber:"+lineNumber);                    
                    ++lineNumber;
                }
                console.log(" lineNumber:"+lineNumber);                    
                totalLinesNumber+=lineNumber;
                if(index==menu.orders.length-1)
                    eachItems.push({deliveryTime:deliveryTime, lines:line, number:lineNumber,delimeter:true});
                else
                    eachItems.push({deliveryTime:deliveryTime, lines:line, number:lineNumber,delimeter:false});                    
            }
        });

        console.log("eachItems:"+JSON.stringify(eachItems));

        let tables=[];
        let pageNumber=1;
        let currentPageNums=0;
        let currentPageItems=[];
        eachItems.forEach((item)=>{
            if(currentPageNums+item.number>linesPerPage){  ///Please verify this line............
                //move into next pages
                tables.push({page:pageNumber,items:currentPageItems})
                pageNumber++;
                currentPageItems=[];
                currentPageItems.push(item);
                currentPageNums=item.number;
            }else{
                currentPageItems.push(item);
                currentPageNums+=item.number;
            }
        })  
        if(currentPageItems.length>0){ //last page
              tables.push({page:pageNumber,items:currentPageItems})            
        }
        console.log("Tables:"+JSON.stringify(tables));

        let pages="<html>\
                    <meta http-equiv=\"Content-Type\" content=\"text/html; charset=utf-8\" />";
        let index;
        for(index=0;index<tables.length;index++){
            // page title
            if(index>0){
                pages+="<H1 style=\"page-break-before: always;\">";
            }else
                pages+="<H1>";
            pages+=this.deliveryDate.substr(0,4)+"년"+
                      this.deliveryDate.substr(5,2)+"월"+
                      this.deliveryDate.substr(8,2)+"일"+this.deliveyDay+"("+(index+1)+"/"+pageNumber+")"+"</H1>";
                      
            pages+="<table style=\"width:100%\;border-collapse:collapse;\">";          
            tables[index].items.forEach(item=>{
                if(item.delimeter){
                    pages+="<tr><td style=\"width:30%;border: solid 1px; border-bottom-width:4px; font-size:1.6em;\">"+item.deliveryTime+"</td>"+
                            "<td style=\"width:60%;border: solid 1px; border-bottom-width:4px; font-size:1.6em;\">"+item.lines+"</td>"
                            "</tr>";
                }else{
                    pages+="<tr><td style=\"width:30%;border: solid 1px; border-bottom-width:1px; font-size:1.6em;\">"+item.deliveryTime+"</td>"+
                            "<td style=\"width:60%;border: solid 1px; border-bottom-width:1px; font-size:1.6em;\">"+item.lines+"</td>"
                            "</tr>";
                }       
            })
            pages+="</table>";
        }
        pages+="</html>";
        console.log("pages:"+pages);
        return pages;
    }

    constructProducePrint(){
        //let rightCharacters:number=27;
        let rightCharacters:number=22;
        let leftCharacters:number=10;
        let linesPerPage=25;
        //let linesPerPage=20;
        let title=this.deliveryDate.substr(0,4)+"년"+
                      this.deliveryDate.substr(5,2)+"월"+
                      this.deliveryDate.substr(8,2)+"일"+this.deliveyDay;
        let currentPage=1;
        let currentLines=0;
        let eachItems=[];
        let totalLinesNumber=0;
        console.log("constrcutProducePrint");
        this.produceList.forEach(item=>{
            let name="";
            let nameLength=1;
            console.log("item.menu.length:"+item.menu.length);
            if(item.menu.length>leftCharacters){
                let remain=item.menu.length;
                let index=0;
                console.log("remain>leftCharacters");
                while(remain>=leftCharacters){
                    name+=item.menu.substr(index,leftCharacters)+"<br>";
                    index+=leftCharacters;
                    remain-=leftCharacters;
                    nameLength++;
                    console.log("name:"+name+"index:"+index);
                }
                if(remain>0){
                    name+=item.menu.substr(index);
                }                
            }else{
                name=item.menu;
            }
            console.log("name:"+name);
            let sumUnits=0;
            let total="";
            if(item.kg>0){ 
                sumUnits++;
                total+=item.kg.toString()+"kg<br>"
            } 
            if(item.mal>0){ 
                sumUnits++;
                total+=item.mal.toString()+"말<br>"                
            }
            if(item.doi>0){ 
                sumUnits++;
                total+=item.doi.toString()+"되<br>"                                
            }
            if(item.jyupsi>0){
                sumUnits++;
                total+=item.jyupsi.toString()+"접시<br>"                                                
            }
            if(item.gae>0){ 
                sumUnits++;
                total+=item.gae.toString()+"개<br>"                                                                
            }
            if(nameLength<sumUnits){
                nameLength=sumUnits;
                console.log("sumUnits change nameLength !!!!"+ sumUnits);
            }

            let list=" ";
            let totalLine="";
            //let boldCount=0;
            item.amount.forEach(amount=>{
                if(amount.amount){ 
                    totalLine+=amount.amount;  ////====> <b>를 넣어야 한다 how?
                }
                if(amount.menu) totalLine+=amount.menu;
                totalLine+='('+amount.time+'-'+amount.timeEnd+'),';
            });
            totalLine=totalLine.substr(0,totalLine.length-1); // remove last comma
            let remain=totalLine.length;

            let index=0;
            let lineNumber=0;
            while(remain>=rightCharacters){
                list+=totalLine.substr(index,rightCharacters);
                remain=remain-rightCharacters;
                index+=rightCharacters;
                console.log("index:"+index);
                ++lineNumber;
                if(remain>0)
                    list+="<br>";
            }
            if(remain>0){
                list+=totalLine.substr(index);
                ++lineNumber;
            }
            console.log("lineNumber:"+lineNumber+"list:"+list);
            if(nameLength>lineNumber){
                //++lineNumber;
                lineNumber=nameLength; // 
                console.log("nameLength change lineNumber...");
            }
            totalLinesNumber+=lineNumber;
            //////////////////////////////////////////
            //bold를 포함한 list 를 다시 계산한다.동작할까?
            totalLine="";
            item.amount.forEach(amount=>{
                if(amount.amount){ 
                    totalLine+=("<b>"+amount.amount+"</b>");  ////====> <b>를 넣어야 한다 how?
                }
                if(amount.menu) totalLine+=amount.menu;
                totalLine+='('+amount.time+'-'+amount.timeEnd+'),';
            });
            totalLine=totalLine.substr(0,totalLine.length-1); // remove last comma
            eachItems.push({lines:totalLine, name:name,number:lineNumber,total:total,delimeter:item.delimeter});    
            ////////////////////////////////////
            //eachItems.push({lines:list, name:name,number:lineNumber,total:total,delimeter:item.delimeter});    
        })

        console.log("eachItems:"+JSON.stringify(eachItems));

        let tables=[];
        let pageNumber=1;
        let currentPageNums=0;
        let currentPageItems=[];
        eachItems.forEach((item)=>{
            if(currentPageNums+item.number>linesPerPage){  ///Please verify this line............
                //move into next pages
                tables.push({page:pageNumber,items:currentPageItems})
                pageNumber++;
                currentPageItems=[];
                currentPageItems.push(item);
                currentPageNums=item.number;
            }else{
                currentPageItems.push(item);
                currentPageNums+=item.number;
            }
        })  
        if(currentPageItems.length>0){ //last page
              tables.push({page:pageNumber,items:currentPageItems})            
        }
        console.log("Tables:"+JSON.stringify(tables));

        let pages="<html>\
                    <meta http-equiv=\"Content-Type\" content=\"text/html; charset=utf-8\" />";
        let index;
        for(index=0;index<tables.length;index++){
            // page title
            if(index>0){
                pages+="<H1 style=\"page-break-before: always;\">";
            }else
                pages+="<H1>";
            pages+=this.deliveryDate.substr(0,4)+"년"+
                      this.deliveryDate.substr(5,2)+"월"+
                      this.deliveryDate.substr(8,2)+"일"+this.deliveyDay+"("+(index+1)+"/"+pageNumber+")"+"</H1>";
                      
            pages+="<table style=\"width:100%\;border-collapse:collapse;\">";          
            tables[index].items.forEach(item=>{
                if(item.hasOwnProperty("delimeter")&& item.delimeter){
                    pages+="<tr><td style=\"width:30%;border: solid 1px; border-bottom-width:4px; font-size:1.6em;\">"+item.name+"</td>"+
                            "<td style=\"width:60%;border: solid 1px; border-bottom-width:4px; font-size:1.6em;\">"+item.lines+"</td>"+
                            "<td style=\"width:10%;border: solid 1px; border-bottom-width:4px; font-size:1.6em;\">"+item.total+"</td>"+
                            "</tr>";
                }else{
                    pages+="<tr><td style=\"width:30%;border: solid 1px; font-size:1.6em;\">"+item.name+"</td>"+
                            "<td style=\"width:55%;border: solid 1px; font-size:1.6em;\">"+item.lines+"</td>"+
                            "<td style=\"width:15%;border: solid 1px; font-size:1.6em;\">"+item.total+"</td>"+
                            "</tr>";
                }
            })
            pages+="</table>";
        }
        pages+="</html>";
        console.log("pages:"+pages);
        return pages;
    }

    constructOrderPrint(){

        let charactersInLine:number=55;
        let linesPerPage=30;

        let title="배달일:"+this.deliveryDate.substr(0,4)+"년"+
                      this.deliveryDate.substr(5,2)+"월"+
                      this.deliveryDate.substr(8,2)+"일"+this.deliveyDay+" 총:"+this.orderList.length+" ";

        let eachPages=[]; // tables(order,addressPrint, menusPrint, memoPrint) per page,pageNumber
        let eachTables=[];
        let totalLinesNumber=0;
        let defaultLinesNumber=4; 

        this.orderList.forEach(item=>{
            let addressPrint="";
            let menusPrint="";
            let memoPrint="";
            let lineNumTable=0;

            lineNumTable+=defaultLinesNumber;

            if(item.recipientAddressDetail){
                addressPrint= item.recipientAddress+" "+item.recipientAddressDetail;
            }else
                addressPrint= item.recipientAddress;
            if(addressPrint.length>charactersInLine){
                lineNumTable+=2;
                addressPrint=addressPrint.substr(0,charactersInLine)+"<br>"+addressPrint.substr(charactersInLine);
            }else{
                ++lineNumTable;
            }
            if(item.memo!=undefined && item.memo!=null && item.memo.trim().length>0){
                let characters=item.memo.trim().length;
                let index=0;
                while((characters-charactersInLine)>0){
                    memoPrint+=item.memo.substr(index,charactersInLine)+"<br>";
                    ++lineNumTable;
                    index+=charactersInLine;
                    characters-=charactersInLine;
                }
                ++lineNumTable;
                memoPrint+=item.memo.substr(index);
                console.log("memoPrint:"+memoPrint);
            }
            let menus="";
            item.menuList.forEach(menu=>{
                if(menu.type=="complex")
                    menus+=menu.category;
                else
                    menus+=menu.category+"-["+menu.menuString+"]";
                if(menu.amount) menus+=menu.amount;
                if(menu.unit) menus+=menu.unit+",";
            })
            console.log("!!!menus:"+menus);
            menus=menus.substr(0,menus.length-1);
            {
                let characters=menus.length;
                let index=0;
                while((characters-charactersInLine)>0){
                    menusPrint+=menus.substr(index,charactersInLine)+"<br>";
                    ++lineNumTable;
                    index+=charactersInLine;
                    characters-=charactersInLine;
                }
                ++lineNumTable;
                menusPrint+=menus.substr(index);
            }
            console.log("!!! menusPrint:"+menusPrint);
            totalLinesNumber+=lineNumTable;
            eachTables.push({ order:item ,addressPrint:addressPrint,memoPrint:memoPrint,menusPrint:menusPrint, lines:lineNumTable });
        })

        let currentPage=1;
        let currentLines=0;
        let tablesPerPage=[];

        eachTables.forEach(table=>{
            console.log("tableLines:"+table.lines+" currentLines:"+currentLines+" currentPage:"+currentPage);
            if(currentLines+(table.lines+1)>linesPerPage){ // table출력+table상단 1줄 번호 출력
                eachPages.push({tables:tablesPerPage,page:currentPage});
                ++currentPage;
                tablesPerPage=[];
                tablesPerPage.push(table);
                currentLines=table.lines+1;    
            }else{  
                tablesPerPage.push(table);
                currentLines+=(table.lines+1);
            }
        });
        if(tablesPerPage.length>0){
            eachPages.push({tables:tablesPerPage,page:currentPage});
        }
        console.log("currentPage: "+currentPage+" currentLines")

        let pages="<html>\n<meta http-equiv=\"Content-Type\" content=\"text/html; charset=utf-8\"/>\n";
        let index;
       let tableNumber=0;     
        for(index=0;index<eachPages.length;index++){
            // page title
            if(index>0){
                pages+="<H1 style=\"page-break-before: always;\">\n";
            }else
                pages+="<H1>";
            pages+=title+"("+(index+1)+"/"+eachPages.length+")</H1>\n";
            eachPages[index].tables.forEach(table=>{
                //console.log("table:"+JSON.stringify(table));
++tableNumber;
pages+="<span>"+tableNumber+"/"+this.orderList.length+"</span><br>\n";
pages+="<table style=\"width:100%;border-collapse:collapse;\">\n";
pages+="<tr>"
pages+="<td style=\"border:solid 1px; font-size:1.6em;\" colspan=\"4\">배달지:"+ table.addressPrint+"</td>\n";
pages+="</tr>\n";
pages+="<tr>\n";
pages+="<td width=\"15%\" style=\"border: solid 1px; font-size:1.2em;\">배달요청시간</td>\n";
pages+="<td width=\"35%\" style=\"border: solid 1px; font-size:1.2em;\">"+ table.order.deliveryTime.slice(11,13) + "시 " + table.order.deliveryTime.slice(14,16) + "분-"+ table.order.deliveryTimeEnd.slice(11,13) + "시 " + table.order.deliveryTimeEnd.slice(14,16) + "분" +"</td>\n";
pages+="<td width=\"10%\" style=\"border: solid 1px; font-size:1.2em;\">수신자</td>\n";
pages+="<td style=\"border:solid 1px;font-size:1.2em;\">"+table.order.recipientName+" "+table.order.recipientPhoneNumber+"</td>\n";
pages+="</tr>\n";
pages+="<tr>\n";
pages+="<td width=\"15%\" style=\"border:solid 1px; font-size:1.2em;\">주문금액</td>\n";
pages+="<td width=\"35%\" style=\"border:solid 1px; font-size:1.2em;\">"+ (table.order.price+table.order.deliveryFee).toLocaleString()+"원"+"(배달료 "+0+"원)</td>\n";
pages+="<td width=\"10%\" style=\"border:solid 1px; font-size:1.2em;\">결제</td>\n";
pages+="<td style=\"border:solid 1px;font-size:1.2em;\">"+table.order.paymentString+"</td>\n";
pages+="</tr>\n";
pages+="<tr>\n";
pages+="<td width=\"20%\" style=\"border:solid 1px; font-size:1.2em;\">주문자</td>\n";
pages+="<td style=\"border:solid 1px; font-size:1.2em;\" colspan=\"3\">"+table.order.buyerName+" "+table.order.buyerPhoneNumber+"<span>(접수:"+table.order.orderedTimeString+")</span></td>\n";
pages+="</tr>\n";
pages+="<tr>\n";
pages+="<td width=\"15%\" style=\"border:solid 1px; font-size:1.2em;\">배송방법</td>\n";
if(table.order.deliveryMethod=="픽업")
    pages+="<td style=\"border:solid 1px;font-size:1.2em;\" colspan=\"3\">"+table.order.deliveryMethod+"</td>\n";  
else if(!table.order.carrier)
    pages+="<td style=\"border:solid 1px;font-size:1.2em;\" colspan=\"3\">"+table.order.deliveryMethod+"</td>\n";  
else
    pages+="<td style=\"border:solid 1px;font-size:1.2em;\" colspan=\"3\">"+table.order.deliveryMethod+"("+table.order.carrier+")</td>\n";  
pages+="</tr>\n";     
pages+="<td style=\"border:solid 1px;font-size:1.2em;\" width=\"100%\" colspan=\"4\">\n";
pages+=table.menusPrint;
pages+="</td>\n";
pages+="</tr>\n";
if(table.memoPrint){ 
    pages+="<tr>\n";
    pages+="<td style=\"border:solid 1px;font-size:1.2em;\" width=\"100%\" colspan=\"4\">"+table.memoPrint+"</td>\n";
    pages+="</tr>\n"; 
}
pages+="</table>\n";
            })  
        }
        pages+="</html>";
        console.log("pages:"+pages);
        return pages;
    }

printPages(titleHead,orders,pageBreakFirst){
        let charactersInLine:number=55; //font크기에 따라 조정이 필요하다.
        let linesPerPage=30; //font크기에 따라 조정이 필요하다. 

        let title=titleHead+" 총:"+orders.length+" ";

        let eachPages=[]; // tables(order,addressPrint, menusPrint, memoPrint) per page,pageNumber
        let eachTables=[];
        let totalLinesNumber=0;
        let defaultLinesNumber=4; 

        orders.forEach(item=>{
            let addressPrint="";
            let menusPrint="";
            let memoPrint="";
            let lineNumTable=0;

            lineNumTable+=defaultLinesNumber;

            if(item.recipientAddressDetail){
                addressPrint= item.recipientAddress+" "+item.recipientAddressDetail;
            }else
                addressPrint= item.recipientAddress;
            if(addressPrint.length>charactersInLine){
                lineNumTable+=2;
                addressPrint=addressPrint.substr(0,charactersInLine)+"<br>"+addressPrint.substr(charactersInLine);
            }else{
                ++lineNumTable;
            }
            if(item.memo!=undefined && item.memo!=null && item.memo.trim().length>0){
                let characters=item.memo.trim().length;
                let index=0;
                while((characters-charactersInLine)>0){
                    memoPrint+=item.memo.substr(index,charactersInLine)+"<br>";
                    ++lineNumTable;
                    index+=charactersInLine;
                    characters-=charactersInLine;
                }
                ++lineNumTable;
                memoPrint+=item.memo.substr(index);
                console.log("memoPrint:"+memoPrint);
            }
            let menus="";
            item.menuList.forEach(menu=>{
                if(menu.type=="complex")
                    menus+=menu.category;
                else
                    menus+=menu.category+"-["+menu.menuString+"]";
                if(menu.amount) menus+=menu.amount;
                if(menu.unit) menus+=menu.unit+",";
            })

            console.log("!!!menus:"+menus);
            menus=menus.substr(0,menus.length-1);
            {
                let characters=menus.length;
                let index=0;
                while((characters-charactersInLine)>0){
                    menusPrint+=menus.substr(index,charactersInLine)+"<br>";
                    ++lineNumTable;
                    index+=charactersInLine;
                    characters-=charactersInLine;
                }
                ++lineNumTable;
                menusPrint+=menus.substr(index);
            }
            console.log("!!! menusPrint:"+menusPrint);
            totalLinesNumber+=lineNumTable;
            eachTables.push({ order:item ,addressPrint:addressPrint,memoPrint:memoPrint,menusPrint:menusPrint, lines:lineNumTable });
        })

        let currentPage=1;
        let currentLines=0;
        let tablesPerPage=[];

        eachTables.forEach(table=>{
            console.log("tableLines:"+table.lines+" currentLines:"+currentLines+" currentPage:"+currentPage);
            if(currentLines+(table.lines+1)>linesPerPage){ // table출력+table상단 1줄 번호 출력
                eachPages.push({tables:tablesPerPage,page:currentPage});
                ++currentPage;
                tablesPerPage=[];
                tablesPerPage.push(table);
                currentLines=table.lines+1;    
            }else{  
                tablesPerPage.push(table);
                currentLines+=(table.lines+1);
            }
        });
        if(tablesPerPage.length>0){
            eachPages.push({tables:tablesPerPage,page:currentPage});
        }
        console.log("currentPage: "+currentPage+" currentLines")

        let pages="";
        let index;
       let tableNumber=0;     
        for(index=0;index<eachPages.length;index++){
            // page title
            if(index>0){
                pages+="<H1 style=\"page-break-before: always;\">\n";
            }else if(pageBreakFirst){
                console.log("!!!pageBreakFirst:"+pageBreakFirst);
                pages+="<H1 style=\"page-break-before: always;\">\n";
            }else
                pages+="<H1>";
            pages+=title+"("+(index+1)+"/"+eachPages.length+")</H1>\n";
            eachPages[index].tables.forEach(table=>{
                //console.log("table:"+JSON.stringify(table));
++tableNumber;
pages+="<span>"+tableNumber+"/"+orders.length+"</span><br>\n";
pages+="<table style=\"width:100%;border-collapse:collapse;\">\n";
pages+="<tr>"
pages+="<td style=\"border:solid 1px; font-size:1.6em;\" colspan=\"4\">배달지:"+ table.addressPrint+"</td>\n";
pages+="</tr>\n";
pages+="<tr>\n";
pages+="<td width=\"15%\" style=\"border: solid 1px; font-size:1.2em;\">배달요청시간</td>\n";
pages+="<td width=\"35%\" style=\"border: solid 1px; font-size:1.2em;\">"+ table.order.deliveryTime.slice(11,13) + "시 " + table.order.deliveryTime.slice(14,16) + "분-"+ table.order.deliveryTimeEnd.slice(11,13) + "시 " + table.order.deliveryTimeEnd.slice(14,16) + "분" +"</td>\n";
pages+="<td width=\"10%\" style=\"border: solid 1px; font-size:1.2em;\">수신자</td>\n";
pages+="<td style=\"border:solid 1px;font-size:1.2em;\">"+table.order.recipientName+" "+table.order.recipientPhoneNumber+"</td>\n";
pages+="</tr>\n";
pages+="<tr>\n";
pages+="<td width=\"15%\" style=\"border:solid 1px; font-size:1.2em;\">주문금액</td>\n";
pages+="<td width=\"35%\" style=\"border:solid 1px; font-size:1.2em;\">"+ (table.order.price+table.order.deliveryFee).toLocaleString()+"원"+"(배달료 "+0+"원)</td>\n";
pages+="<td width=\"10%\" style=\"border:solid 1px; font-size:1.2em;\">결제</td>\n";
pages+="<td style=\"border:solid 1px;font-size:1.2em;\">"+table.order.paymentString+"</td>\n";
pages+="</tr>\n";
pages+="<tr>\n";
pages+="<td width=\"20%\" style=\"border:solid 1px; font-size:1.2em;\">주문자</td>\n";
pages+="<td style=\"border:solid 1px; font-size:1.2em;\" colspan=\"3\">"+table.order.buyerName+" "+table.order.buyerPhoneNumber+"<span>(접수:"+table.order.orderedTimeString+")</span></td>\n";
pages+="</tr>\n";
//pages+="<tr>\n"; 
pages+="<td style=\"border:solid 1px;font-size:1.2em;\" width=\"100%\" colspan=\"4\">\n";
pages+=table.menusPrint;
pages+="</td>\n";
pages+="</tr>\n";
if(table.memoPrint){ 
    pages+="<tr>\n";
    pages+="<td style=\"border:solid 1px;font-size:1.2em;\" width=\"100%\" colspan=\"4\">"+table.memoPrint+"</td>\n";
    pages+="</tr>\n"; 
}
pages+="</table>\n";
            })  
        }
        console.log("pages:"+pages);
        return pages;
}

constructDeliveryPrint(){
//
//H1 배달자별 다른 페이지  title:배달일(배달자:xxx) 배달수: 개
// eachCarriers
//
// 픽업,냉동,기타 각각 다른 페이지
// pickup
// fronzon
// etc
// 
   let pages="<html>\n<meta http-equiv=\"Content-Type\" content=\"text/html; charset=utf-8\"/>\n";

   let defaultTitle="배달일:"+this.deliveryDate.substr(0,4)+"년"+
                      this.deliveryDate.substr(5,2)+"월"+
                      this.deliveryDate.substr(8,2)+"일"+this.deliveyDay;

   let index=0;
   let pageBreakFirst:boolean=false;
   for(index=0;index<this.assignOrderList.length;index++){
       console.log("hum...storageProvider.assignOrderList[index].orders");
       if(this.assignOrderList[index].orders.length==0){ 
           continue;
       }else{
            let title;
            title=defaultTitle+"("+ this.assignOrderList[index].name+")";
            pages+=this.printPages(title,this.assignOrderList[index].orders,pageBreakFirst);
            pageBreakFirst=true;

       }
   }

   let title;
   if(this.unassingOrderDeliveryList.length>0){
        title=defaultTitle+" 배송 ";
        pages+=this.printPages(title,this.unassingOrderDeliveryList,pageBreakFirst);
        pageBreakFirst=true;
   }
   if(this.unassingOrderFrozenList.length>0){
        title=defaultTitle+" 냉동 ";
        pages+=this.printPages(title,this.unassingOrderFrozenList,pageBreakFirst);
        pageBreakFirst=true;
   }
   if(this.unassingOrderPickupList.length>0){
        title=defaultTitle+" 픽업 ";
        console.log("pageBreakFirst:"+pageBreakFirst);
        pages+=this.printPages(title,this.unassingOrderPickupList,pageBreakFirst);
        pageBreakFirst=true;
   }
   if(this.unassingOrderEtcList.length>0){
        title=defaultTitle+" 기타 ";
        pages+=this.printPages(title,this.unassingOrderEtcList,pageBreakFirst);
        pageBreakFirst=true;
   }
   pages+="</html>";
   return pages;
}

 configureOrderInput(order) {
        //console.log("configureOrderInput:"+JSON.stringify(order));
        if (order == undefined)
            order = {};
        if (order.buyerName != undefined
            && order.buyerName == order.recipientName
            && order.buyerPhoneNumber == order.recipientPhoneNumber) {
            order.receiverSame = true;
        }
        else {
            order.receiverSame = false;
        }
        if (order.recipientAddress == undefined) {
            order.recipientAddress = "주소 선택";
            order.addressInputType = "unknown";
        }
        else if (order.recipientAddressDetail == undefined || order.recipientAddressDetail.trim().length == 0) {
            order.addressInputType = "manual";
        }
        else {
            order.addressInputType = "auto";
        }
        //결제 방법 변환(?)
      /*현금선불:paid-pre
        현금후불:unpaid-after =>paid-after
        현금이체:unpaid-transaction
        현금보류:unknown
        월말정산:month 
        카드선불:paid-pre
        카드기 :unpaid=>paid
        */
        order.paymentOption=order.paymentMethod+'-'+order.payment;
        console.log("order.paymentOption:"+order.paymentOption);

        if (order.menuList == undefined) {
            order.menuList = [];
        }
        if (order.deliveryTime == undefined) {
        }else{
            order.deliveryTime= order.deliveryTime; 
            console.log("deliveryTime is "+order.deliveryTime+" in modification");
        }
        return order;
    }

  putMenuSetTable(menu){
        let index=this.setTable.findIndex(function (val) {
            console.log("val.menu:" + JSON.stringify(val));
            if (val.name == menu.name) //Please update this....
                return true;
            else
                return false;
        });
        if(index<0){
            let orders=[];
            orders.push(menu);
            this.setTable.push({name:menu.name,orders:orders})
        }else{
            this.setTable[index].orders.push(menu);
        }
  }

  configureSetSection(){
    console.log("order:"+JSON.stringify(this.orderList));

    this.setTable=[];
    this.orderList.forEach( (order)=>{
        var min = parseInt(order.deliveryTime.slice(11, 13)) * 60 + parseInt(order.deliveryTime.slice(14, 16));        
        var hhmm = order.deliveryTime.slice(11, 13) + "시 " + order.deliveryTime.slice(14, 16) + "분";   
        var hhmmEnd = order.deliveryTime.slice(11, 13) + "시 " + order.deliveryTime.slice(14, 16) + "분";   
        order.menuList.forEach(menu=>{
            if(menu.type=="complex"){
                this.putMenuSetTable({name:menu.category, amount:menu.amount,min:min,hhmm:hhmm,hhmmEnd:hhmmEnd});
            }else if(menu.type=="complex-choice"){
                    var menuObjs = JSON.parse(menu.menu);
                    let string="";
                    menuObjs.forEach(menuObj=>{
                        var keys :any= Object.keys(menuObj);
                        keys.forEach(key=>{
                            string+=key+",";
                        })
                    });
                    string=string.substr(0,string.length-1); // 마지막 ,를 없앤다.
                    this.putMenuSetTable({name:menu.category, option:"("+string+")", amount:menu.amount,min:min,hhmm:hhmm,hhmmEnd:hhmmEnd});
            }
        })
    }) 
    //sort each menu
    this.setTable.forEach(menu=>{
        menu.orders.sort(function(a,b){
                if (a.min < b.min)
                    return -1;
                if (a.min > b.min)
                    return 1;
                return 0;
        })
    });

    this.setTable.sort(function (a, b) {
                if (a.name < b.name)
                    return -1;
                if (a.name > b.name)
                    return 1;
                return 0;
            });            
    console.log("setTable:"+JSON.stringify(this.setTable)); 
  }    
  //////////////////////////////////////////////////////////////
  // Delivery Section
    assingCarrier(order) {
        console.log("order:"+JSON.stringify(order));
        //please Update carrier, sort order list again
        this.assignCarrier(order.id,order.carrier).then(()=>{
            this.refresh("order");
        },err=>{
            if(typeof err==="string" && err.indexOf("invalidId")>=0){
                    let alert = this.alertCtrl.create({
                        title: '존재하지 않는 주문입니다.',
                        buttons: ['확인']
                    });
                    alert.present();
            }else if(typeof err==="string" && err.indexOf("invalidCarrier")>=0){
                    let alert = this.alertCtrl.create({
                        title: '존재하지 않는 배달원입니다.',
                        buttons: ['확인']
                    });
                    alert.present();
            }else if(typeof err==="string" ){
                    let alert = this.alertCtrl.create({
                        title: '배달원 설정에 실패했습니다.',
                        subTitle:err,
                        buttons: ['확인']
                    });
                    alert.present();
            }else{
                    let alert = this.alertCtrl.create({
                        title: '배달원 설정에 실패했습니다.',
                        subTitle:JSON.stringify(err),
                        buttons: ['확인']
                    });
                    alert.present();                
            }
        })
    };

    modifyCarrier(order) {
        //please Update carrier, sort order list again
        this.assignCarrier(order.id,order.updateCarrier).then(()=>{
            this.refresh("order");
        },err=>{
            if(typeof err==="string" && err.indexOf("invalidId")>=0){
                    let alert = this.alertCtrl.create({
                        title: '존재하지 않는 주문입니다.',
                        buttons: ['확인']
                    });
                    alert.present();
            }else if(typeof err==="string" && err.indexOf("invalidCarrier")>=0){
                    let alert = this.alertCtrl.create({
                        title: '존재하지 않는 배달원입니다.',
                        buttons: ['확인']
                    });
                    alert.present();
            }else if(typeof err==="string" ){
                    let alert = this.alertCtrl.create({
                        title: '배달원 설정에 실패했습니다.',
                        subTitle:err,
                        buttons: ['확인']
                    });
                    alert.present();
            }else{
                    let alert = this.alertCtrl.create({
                        title: '배달원 설정에 실패했습니다.',
                        subTitle:JSON.stringify(err),
                        buttons: ['확인']
                    });
                    alert.present();                
            }
        })
    };

}
