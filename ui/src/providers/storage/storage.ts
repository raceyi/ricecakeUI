import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import {ConfigProvider} from "../config/config";
/*
  Generated class for the StorageProvider provider.

  See https://angular.io/guide/dependency-injection for more info on providers
  and Angular DI.
*/
@Injectable()
export class StorageProvider {
  orderList:any=[];

   carriers=[
        {
            "name": "박서준"
        },
        {
            "name": "정유미"
        },
        {
            "name": "이서진"
        }
    ];

  menus:any=[
        {
            "category": "미니설기",
            "menu": "100"
        },
        {
            "category": "미니설기",
            "menu": "무지"
        },
        {
            "category": "미니설기",
            "menu": "첫돌"
        },
        {
            "category": "미니설기",
            "menu": "하트"
        },
        {
            "category": "멥떡",
            "menu": "4색 송편"
        },
        {
            "category": "멥떡",
            "menu": "가래떡"
        },
        {
            "category": "멥떡",
            "menu": "꿀떡"
        },
        {
            "category": "멥떡",
            "menu": "녹두호박설기"
        },
        {
            "category": "멥떡",
            "menu": "단호박소담"
        },
        {
            "category": "멥떡",
            "menu": "딸기 설기"
        },
        {
            "category": "멥떡",
            "menu": "떡국떡"
        },
        {
            "category": "멥떡",
            "menu": "무지개 설기"
        },
        {
            "category": "멥떡",
            "menu": "바람떡"
        },
        {
            "category": "멥떡",
            "menu": "밤콩설기"
        },
        {
            "category": "멥떡",
            "menu": "백설기"
        },
        {
            "category": "멥떡",
            "menu": "쑥밤콩설기"
        },
        {
            "category": "멥떡",
            "menu": "절편"
        },
        {
            "category": "십리향1송이",
            "menu": "[{\"모듬찰떡\":1},{\"단호박소담\":1},{\"완두시루떡\":1}]"
        },
        {
            "category": "제사편",
            "menu": "거피"
        },
        {
            "category": "제사편",
            "menu": "녹두"
        },
        {
            "category": "제사편",
            "menu": "콩"
        },
        {
            "category": "제사편",
            "menu": "콩 흑임자"
        },
        {
            "category": "제사편",
            "menu": "흑임자"
        },
        {
            "category": "찰떡",
            "menu": "고구마단호박찰떡"
        },
        {
            "category": "찰떡",
            "menu": "고물 인절미"
        },
        {
            "category": "찰떡",
            "menu": "모듬영양찰떡"
        },
        {
            "category": "찰떡",
            "menu": "수수떡"
        },
        {
            "category": "찰떡",
            "menu": "약식"
        },
        {
            "category": "찰떡",
            "menu": "완두시루떡"
        },
        {
            "category": "찰떡",
            "menu": "이티떡"
        },
        {
            "category": "찰떡",
            "menu": "인절미"
        },
        {
            "category": "찰떡",
            "menu": "콩영양찰떡"
        },
        {
            "category": "찰떡",
            "menu": "팥시루떡"
        },
        {
            "category": "멥편",
            "menu": "거피팥"
        },
        {
            "category": "멥편",
            "menu": "녹두"
        },
        {
            "category": "멥편",
            "menu": "콩"
        },
        {
            "category": "멥편",
            "menu": "팥"
        },
        {
            "category": "답례떡",
            "menu": "매화2송이"
        },
        {
            "category": "답례떡",
            "menu": "매화3송이"
        },
        {
            "category": "답례떡",
            "menu": "매화5송이"
        },
        {
            "category": "떡케이크",
            "menu": "밤콩백설기케이크"
        },
        {
            "category": "떡케이크",
            "menu": "백설기케이크"
        }
    ];

  constructor(public http: HttpClient,public configProvider:ConfigProvider) {
    console.log('Hello StorageProvider Provider');
    this.orderList=   [
        {
            "buyerName": "이경주",
            "totalPrice": 34000,
            "deliveryFee": 4000,
            "deliveryTime": "2018-03-29T03:00:00.000Z",
            "recipientAddress": "xxxxx",
            "orderedTime": "2018-03-29T10:33:13.985Z",
            "recipientName": "이경주",
            "payment": "unpaid-pre",
            "memo": "맛있게....",
            "paymentMethod": "cash",
            "carrier": null,
            "recipientPhoneNumber": "010-2722-8226",
            "price": 30000,
            "id": 69,
            "menuList": [
                {
                    "menuString": "모듬찰떡1 단호박소담1 완두시루떡1 ",
                    "amount": "1",
                    "unit": "개",
                    "category": "십리향1송이",
                    "menu": "[{\"모듬찰떡\":1},{\"단호박소담\":1},{\"완두시루떡\":1}]"
                }
            ],
            "deliveryMethod": "배송",
            "buyerPhoneNumber": "010-2722-8226",
            "hide": false
        },
        {
            "buyerName": "이경주",
            "totalPrice": 34000,
            "deliveryFee": 4000,
            "deliveryTime": "2018-03-29T03:00:00.000Z",
            "recipientAddress": "xxxxx",
            "orderedTime": "2018-03-29T10:32:34.440Z",
            "recipientName": "이경주",
            "payment": "unpaid-pre",
            "memo": "맛있게....",
            "paymentMethod": "cash",
            "carrier": null,
            "recipientPhoneNumber": "010-2722-8226",
            "price": 30000,
            "id": 66,
            "menuList": [
                {
                    "menuString": "모듬찰떡1 단호박소담1 완두시루떡1 ",
                    "amount": "1",
                    "unit": "개",
                    "category": "십리향1송이",
                    "menu": "[{\"모듬찰떡\":1},{\"단호박소담\":1},{\"완두시루떡\":1}]"
                }
            ],
            "deliveryMethod": "배송",
            "buyerPhoneNumber": "010-2722-8226",
            "hide": false
        },
        {
            "buyerName": "이경주",
            "totalPrice": 34000,
            "deliveryFee": 4000,
            "deliveryTime": "2018-03-29T03:00:00.000Z",
            "recipientAddress": "xxxxx",
            "orderedTime": "2018-03-29T10:33:12.849Z",
            "recipientName": "이경주",
            "payment": "unpaid-pre",
            "memo": "맛있게....",
            "paymentMethod": "cash",
            "carrier": null,
            "recipientPhoneNumber": "010-2722-8226",
            "price": 30000,
            "id": 68,
            "menuList": [
                {
                    "menuString": "모듬찰떡1 단호박소담1 완두시루떡1 ",
                    "amount": "1",
                    "unit": "개",
                    "category": "십리향1송이",
                    "menu": "[{\"모듬찰떡\":1},{\"단호박소담\":1},{\"완두시루떡\":1}]"
                }
            ],
            "deliveryMethod": "배송",
            "buyerPhoneNumber": "010-2722-8226",
            "hide": false
        },
        {
            "buyerName": "이경주",
            "totalPrice": 34000,
            "deliveryFee": 4000,
            "deliveryTime": "2018-03-29T03:00:00.000Z",
            "recipientAddress": "xxxxx",
            "orderedTime": "2018-03-29T10:33:11.721Z",
            "recipientName": "이경주",
            "payment": "unpaid-pre",
            "memo": "맛있게....",
            "paymentMethod": "cash",
            "carrier": null,
            "recipientPhoneNumber": "010-2722-8226",
            "price": 30000,
            "id": 67,
            "menuList": [
                {
                    "menuString": "모듬찰떡1 단호박소담1 완두시루떡1 ",
                    "amount": "1",
                    "unit": "개",
                    "category": "십리향1송이",
                    "menu": "[{\"모듬찰떡\":1},{\"단호박소담\":1},{\"완두시루떡\":1}]"
                }
            ],
            "deliveryMethod": "배송",
            "buyerPhoneNumber": "010-2722-8226",
            "hide": false
        }
    ];

    this.convertMenuInfo(this.menus);
    this.convertOrderList(this.orderList);
    this.orderList.sort(function(a,b){
            if (a.id < b.id) return -1;
            if (a.id > b.id) return 1;
            return 0;
    } );
    console.log("orderList.length:"+this.orderList.length);
  }
  
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
