import { NavController,AlertController,Platform } from 'ionic-angular';
import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
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

  newOrderInputShown:boolean=false;

  constructor(public http: HttpClient,
              private platform: Platform,  
              public serverProvider:ServerProvider,
              public configProvider:ConfigProvider) {
    console.log('Hello StorageProvider Provider');

    this.platform.ready().then(() => {
            this.refresh();
    });
    var now = new Date().getTime();
    this.setDeliveryDate(now);
    console.log("deliveryDate:" + this.deliveryDate);
  }
  
  refresh(){ // 서버로 부터 최신 정보를 가져온다.
          this.serverProvider.getCarriers().then((carriers:any)=>{
                this.carriers=carriers;
            },err=>{

            })
            this.serverProvider.getMenus().then((menus)=>{
                this.convertMenuInfo(menus);
            },err=>{

            })
            this.serverProvider.getOrders(this.deliveryDate.substr(0,10)).then((orders)=>{
                this.orderList=orders;
                this.convertOrderList(this.orderList);
                this.orderList.sort(function(a,b){
                        if (a.id > b.id) return -1;
                        if (a.id < b.id) return 1;
                        return 0;
                } );
                console.log("call reconfigureDeliverySection...");
                this.reconfigureDeliverySection();
                this.configureProduceSection();                                
                console.log("orderList.length:"+this.orderList.length);
            },err=>{

            });
            this.serverProvider.getOrdersInTrash().then((orders)=>{
                this.trashList=orders;
                this.convertOrderList(this.trashList);
            },err=>{

            })

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
        this.refresh();
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
        this.serverProvider.getOrders(this.deliveryDate.substr(0,10)).then((orders)=>{
                this.orderList=orders;
                this.convertOrderList(this.orderList);
                this.orderList.sort(function(a,b){
                        if (a.id < b.id) return -1;
                        if (a.id > b.id) return 1;
                        return 0;
                } );
                this.reconfigureDeliverySection();
                this.configureProduceSection();
                this.newOrderInputShown=false;
                console.log("orderList.length:"+this.orderList.length);
        },err=>{

        });
    };
    
    orderGoTomorrow() {
        var tomorrow = new Date(this.deliveryDate).getTime() + 24 * 60 * 60 * 1000;
        console.log("order move tomorrow:" + this.getISOtime(tomorrow));
        this.setDeliveryDate(tomorrow);
        this.serverProvider.getOrders(this.deliveryDate.substr(0,10)).then((orders)=>{
                this.orderList=orders;
                this.convertOrderList(this.orderList);
                this.orderList.sort(function(a,b){
                        if (a.id < b.id) return -1;
                        if (a.id > b.id) return 1;
                        return 0;
                } );
                this.reconfigureDeliverySection();
                this.configureProduceSection(); 
                this.newOrderInputShown=false;               
                console.log("orderList.length:"+this.orderList.length);
        },err=>{

        });
    };


    convertMenuInfo(menus){
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
            menuInfos.push({category:category,menus:[],menuStrings:[]});
        })
        menus.forEach(menu=>{
             let menuString=menu.menu;
             if(menu.menu.indexOf("[")==0){  
                let menuObjs=JSON.parse(menu.menu);
                console.log("menuObj:"+JSON.stringify(menuObjs));
                menuString="";
                menuObjs.forEach(menuObj=>{
                   let key:any=Object.keys(menuObj);
                   menuString+=key+menuObj[key]+" ";
                });
             }
                console.log("menuString:"+menuString);

                menuInfos[categories.indexOf(menu.category)].menus.push(menu.menu);
                menuInfos[categories.indexOf(menu.category)].menuStrings.push(menuString);
                console.log("index:"+categories.indexOf(menu.category));
                console.log(JSON.stringify(menuInfos[categories.indexOf(menu.category)].menus));

        })     
        
          this.menus = menuInfos;
          console.log("menus: " + JSON.stringify(this.menus));
  }

  convertOrderList(orderList){
    orderList.forEach(order=>{
           order.orderedTimeString= order.orderedTime.substr(0,4)+"년"+order.orderedTime.substr(5,2)+"월"+
                                    order.orderedTime.substr(8,2)+"일"+order.orderedTime.substr(11,2)+"시"+ 
                                    order.orderedTime.substr(14,2)+"분";
           console.log(order.orderedTime+"orderedTimeString:"+order.orderedTimeString);
           if(order.paymentMethod=="cash"){
               if(order.payment.startsWith("paid")){
                    order.paymentString="현금-완납";
               }else if(order.payment.startsWith("unpaid")){ //must be unpaid
                    let strs=order.payment.split("-");
                    if(strs[1]=="pre")
                        order.paymentString="현금-선불";
                    else if(strs[1]=="after")    
                        order.paymentString="현금-후불";
               }
           }else if(order.paymentMethod=="card"){ //must be card
               if(order.payment.startsWith("paid")){
                    order.paymentString="카드-완납";
               }else if(order.payment.startsWith("unpaid")){ //must be unpaid
                    let strs=order.payment.split("-");
                    if(strs[1]=="pre")
                        order.paymentString="카드-선불(미납)";
                    else if(strs[1]=="after")   
                        order.paymentString="카드-후불(미납)";
               }
           }
    });
  }

    saveOrder(order){
        return new Promise((resolve,reject)=>{    
            this.serverProvider.saveOrder(order).then(()=>{
                this.refresh();
                resolve();
            },(err)=>{
                this.refresh();
                reject(err);
            });
        });
    }

    updateOrder(order){
        return new Promise((resolve,reject)=>{            
        this.serverProvider.updateOrder(order).then(()=>{
            this.refresh();
            resolve();
        },(err)=>{
            this.refresh();
            reject(err);
        });
        });
    }

    deleteOrders(){
        return new Promise((resolve,reject)=>{                    
        this.serverProvider.deleteOrders().then(()=>{
            this.refresh();            
            resolve();
        },(err)=>{
            this.refresh();
            reject(err);
        });          
        });
    }

    hideOrder(id){
        return new Promise((resolve,reject)=>{                            
        this.serverProvider.hideOrder(id).then(()=>{
            this.refresh();            
            resolve();
        },(err)=>{
            this.refresh();
            reject(err);
        });          
        })
    }

    showOrder(id){
        return new Promise((resolve,reject)=>{                                    
        this.serverProvider.showOrder(id).then(()=>{
            this.refresh();            
            resolve();    
        },(err)=>{
            this.refresh();
            reject(err);
        });          
        });
    }
    
    assignCarrier(orderid,carrier){
        return new Promise((resolve,reject)=>{                                            
        this.serverProvider.assignCarrier(orderid,carrier).then(()=>{
           this.refresh();            
           resolve(); 
        },(err)=>{
            this.refresh();
            reject(err);
        });   
        });
    }
    
    addCarrier(name){
        return new Promise((resolve,reject)=>{                                            
        this.serverProvider.addCarrier(name).then(()=>{
           this.refresh();            
           resolve(); 
        },(err)=>{
            this.refresh();
            reject(err);
        });   
        });
    }

    deleteCarrier(name){
        return new Promise((resolve,reject)=>{                                            
        this.serverProvider.deleteCarrier(name).then(()=>{
            this.refresh();            
            resolve(); 
        },(err)=>{
            this.refresh();
            reject(err);
        });   
        });
    }

    addMenu(category,name){
        return new Promise((resolve,reject)=>{                                                    
        this.serverProvider.addMenu(category,name).then(()=>{
           this.refresh();            
           resolve(); 
        },(err)=>{
            this.refresh();
            reject(err);
        });   
        });
    }

    deleteMenu(category,name){
        return new Promise((resolve,reject)=>{                                            
        this.serverProvider.deleteMenu(category,name).then(()=>{
           this.refresh();                        
            resolve();    
        },(err)=>{
            this.refresh();
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
                var index = this.assignOrderList.findIndex(function (carrierInfo) {
                    if (order.carrier == carrierInfo.name) {
                        return true;
                    }
                    return false;
                });
                this.assignOrderList[index].orders.push(order);
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
        console.log("this.assignOrderList-end:" + JSON.stringify(this.assignOrderList));
    }

    /////////////////////////////////////////////////////////
    //   Produce section - begin
    addMenuInList(menu, deliveryTime, amount) {
        console.log("menu.menu:" + menu.menu);
        var hhmm = deliveryTime.slice(11, 13) + "시 " + deliveryTime.slice(14, 16) + "분";
        var min = parseInt(deliveryTime.slice(11, 13)) * 60 + parseInt(deliveryTime.slice(14, 16));
        var index = this.produceList.findIndex(function (val) {
            console.log("val.menu:" + JSON.stringify(val));
            if (val.menu == menu.menu)
                return true;
            else
                return false;
        });
        console.log("index:" + index);
        if (index < 0) {
            console.log
            this.produceList.push({ menu: menu.menu, amount: [{ amount: amount + menu.unit, time: hhmm, min: min }] });
        }
        else {
            this.produceList[index].amount.push({ amount: amount + menu.unit, time: hhmm, min: min });
        }
        console.log("produceList:" + JSON.stringify(this.produceList));
    };

    configureProduceSection() {
        this.produceList = []; //[{menu:"단호박소담",amount:[{amount:"1kg",time:"03:00"}]}]
        this.orderList.forEach( (order)=> {
            order.menuList.forEach( (menu) =>{
                console.log("produceSection- menu:"+JSON.stringify(menu));
                if (menu.menu.indexOf("[") == 0) {
                    var menuObjs = JSON.parse(menu.menu);
                    menuObjs.forEach( (menuObj)=> {
                        var key :any= Object.keys(menuObj);
                        var menuInput = { menu: key, unit: menu.unit };
                        var amount = Number(menuObj[key]) * Number(menu.amount);
                        console.log("amount:" + amount);
                        this.addMenuInList(menuInput, order.deliveryTime, amount);
                    });
                }
                else {
                    this.addMenuInList(menu, order.deliveryTime, menu.amount);
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
        });
    };

}
