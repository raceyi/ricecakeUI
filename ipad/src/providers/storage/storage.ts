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
  carriers=[];
  menus=[];

  deliveryDate;
  deliveyDay;
  
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
                this.convertOrderList(this.orderList);
                this.orderList.sort(function(a,b){
                        if (a.id < b.id) return -1;
                        if (a.id > b.id) return 1;
                        return 0;
                } );
                console.log("orderList.length:"+this.orderList.length);
            },err=>{

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
        var body = { deliveryDate: this.getISOtime(yesterday).substring(0, 10) };
        console.log("body: " + JSON.stringify(body));
        /*
            this.http.setDataSerializer("json");
            this.http.post("https://8ca0a9qq5g.execute-api.ap-northeast-2.amazonaws.com/latest/getOrderWithDeliveryDate",body,{"Content-Type":"application/json"}).then((res:any)=>{
              console.log("res:"+JSON.stringify(res));
              let response=JSON.parse(res.data);
              if(response.result=="success"){
                    this.setDeliveryDate(yesterday);
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
    */
    };
    
    orderGoTomorrow() {
        var tomorrow = new Date(this.deliveryDate).getTime() + 24 * 60 * 60 * 1000;
        console.log("order move tomorrow:" + this.getISOtime(tomorrow));
        this.setDeliveryDate(tomorrow);
        var body = { deliveryDate: this.getISOtime(tomorrow).substring(0, 10) };
        console.log("body: " + JSON.stringify(body));
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
}
