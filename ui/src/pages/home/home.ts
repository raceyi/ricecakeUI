import { Component } from '@angular/core';
import { NavController,AlertController } from 'ionic-angular';
import {StorageProvider} from "../../providers/storage/storage";
import {ServerProvider} from "../../providers/server/server";
import {CarrierManagementPage} from "../carrier-management/carrier-management";

import {ManagerEntrancePage} from '../manager-entrance/manager-entrance';
import {TrashPage} from '../trash/trash';

import * as moment from 'moment';
var gHomePage;

@Component({
  selector: 'page-home',
  templateUrl: 'home.html'
})
export class HomePage {
    section:string;
    assignOrderList;
    unassingOrderDeliveryList;
    unassingOrderPickupList;
    unassingOrderFrozenList;
    unassingOrderEtcList;
    filter=[];
    produceList;
    etcProduceList;
    produceTables;

    deliveryDate;
    deliveyDay;

    newOrderInputShown;
    
    searchKeyWord;
    newOrder;

     constructor(public navCtrl:NavController, public alertCtrl:AlertController, public serverProvider:ServerProvider, public storageProvider:StorageProvider) {
        gHomePage=this;
        this.section = "order";
        /////////////////////////////
        // 배달 섹션 변수들 -begin
        this.assignOrderList = []; //[{name:"이경주,orders:[]}]
        this.unassingOrderDeliveryList = []; //배달:delivery,픽업:pickup,냉동:frozen,기타:etc
        this.unassingOrderPickupList = [];
        this.unassingOrderFrozenList = [];
        this.unassingOrderEtcList = [];
        // 배달 섹션 변수들 -end
        //////////////////////////////
        /////////////////////////////
        // 생산 섹션 변수들 -begin
        this.produceList = [];
        this.etcProduceList=[];
        // 생산 섹션 변수들 -end
        //////////////////////////////
        this.newOrderInputShown = false;
        var now = new Date().getTime();
        this.setDeliveryDate(now);
        console.log("deliveryDate:" + this.deliveryDate);
        this.reconfigureDeliverySection();
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
    
    getISO8601Format(milliseconds) {
        var d = new Date(milliseconds);
        var mm = d.getMonth() < 9 ? "0" + (d.getMonth() + 1) : (d.getMonth() + 1); // getMonth() is zero-based
        var dd = d.getDate() < 10 ? "0" + d.getDate() : d.getDate();
        var hh = d.getHours() < 10 ? "0" + d.getHours() : d.getHours();
        var min = d.getMinutes() < 10 ? "0" + d.getMinutes() : d.getMinutes();
        return d.getFullYear() + '-' + (mm) + '-' + dd + 'T' + hh + ":" + min + moment().format("Z");
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

    orderSection() {
        this.section = 'order';
    };

    deliverySection() {
        this.reconfigureDeliverySection();
        this.section = 'delivery';
    };

    produceSection() {
        this.section = 'produce';
        this.configureProduceSection();
    };

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
    
    /////////////////////////////////////////////////////////
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
            order.recipientAddress = "도로명 주소 선택";
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
        order.paymentOption=order.paymentMethod+order.payment;
        console.log("order.paymentOption:"+order.paymentOrder);

        if (order.menuList == undefined) {
            order.menuList = [];
        }
        if (order.deliveryTime == undefined) {
            console.log("deliveryDate:" + this.deliveryDate);
            var deliveryDate = new Date(this.deliveryDate);
            deliveryDate.setHours(0);
            deliveryDate.setMinutes(0);
            deliveryDate.setSeconds(0);
            deliveryDate.setMilliseconds(0);
            order.deliveryTime = this.getISO8601Format(deliveryDate.getTime()); //새주문 입력시 배달시간
        }
        return order;
    };

    createNewOrder() {
        //1. initalize values for new order, <order>를 호출하기 전에 해당 변수들을 모두 초기화해줘야 함.
        this.newOrder = this.configureOrderInput({});
        //2. show order input area
        this.newOrderInputShown = true;
    };

    savePayment(order){
        if(order.paymentMethod=="cash"){
              order.payment="paid-after";
        }else if(order.paymentMethod=="card"){
              order.payment="paid"; 
        } 
        /*    
        this.storageProvider.saveOrder(order).then(()=>{///
            },err=>{
                console.log("err:"+JSON.stringify(err));
                if(typeof err==="string" && err.indexOf("SMS-")>=0){
                    let alert = this.alertCtrl.create({
                        title: '문자발송에 실패했습니다.',
                        buttons: ['확인']
                    });
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
         */
    }

    saveOrder (order, existing) {
        console.log("saveOrder-output:" + JSON.stringify(order));
        if (order == undefined && existing == undefined) {
            console.log("cancel order creation");
            this.newOrderInputShown = false;
            return;
        }
        else if (order == undefined && existing) {
            console.log("cancel order modification");
            existing.modification = false;
            return;
        }

        if (order.id == undefined) {
            console.log("order creation " + JSON.stringify(order));
            //save order in DB by calling server API. 
            this.newOrderInputShown = false;
        }
        else {
            console.log(" "+order.deliveryTimeUpdate+" "+order.deliveryTime);
            order.deliveryTime=order.deliveryTimeUpdate;
            // please update DB here
            console.log("order modification");
            //update order List in DB by calling server API.
            existing.modification = false; 
            if(order.diffDate){
                    let alert = this.alertCtrl.create({
                        title:  order.deliveryTime.substr(0,10)+'으로 배달일을 이동하시겠습니까?',
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
                                    return;
                                }
                                }]
                    });
                    alert.present();                                    
            }   
        }
    };
    
    modifyOrder(order) {
        order.modification = true;
    };
    /////////////////////////////////////////////////////////
    //   Delivery section - begin
    assingCarrier(order) {
        //please Update carrier, sort order list again
        if (order.carrier) {
            this.reconfigureDeliverySection();
        }
    };
    modifyCarrier(order) {
        //please Update carrier, sort order list again
        order.carrier = order.updateCarrier;
        this.reconfigureDeliverySection();
    };
    reconfigureDeliverySection(){
        var _this = this;
        this.assignOrderList = []; //[{name:"이경주,orders:[]}]
        this.unassingOrderDeliveryList = []; //배달:delivery,픽업:pickup,냉동:frozen,기타:etc
        this.unassingOrderPickupList = [];
        this.unassingOrderFrozenList = [];
        this.unassingOrderEtcList = [];
        this.storageProvider.carriers.forEach(function (carrier) {
            _this.assignOrderList.push({ name: carrier.name, orders: [] });
        });
        this.storageProvider.orderList.forEach(function (order) {
            if (order.carrier) {
                console.log("order.carrier:" + order.carrier);
                var index = _this.assignOrderList.findIndex(function (carrierInfo) {
                    if (order.carrier == carrierInfo.name) {
                        return true;
                    }
                    return false;
                });
                _this.assignOrderList[index].orders.push(order);
            }
            else {
                if (order.deliveryMethod == "배달")
                    _this.unassingOrderDeliveryList.push(order);
                else if (order.deliveryMethod == "픽업")
                    _this.unassingOrderPickupList.push(order);
                else if (order.deliveryMethod == "냉동")
                    _this.unassingOrderFrozenList.push(order);
                else if (order.deliveryMethod == "기타")
                    _this.unassingOrderEtcList.push(order);
            }
        });
        console.log("this.assignOrderList:" + JSON.stringify(this.assignOrderList));
    };
    
    manageCarrier() {
        this.navCtrl.push(CarrierManagementPage);
    };
    //   Delivery section - end
    /////////////////////////////////////////////////////////
    /////////////////////////////////////////////////////////
    //   Produce section - begin
    addMenuInList(menu, deliveryTime, amount) {
        console.log("addMenuInList:.. menu:"+JSON.stringify(menu));
        console.log("menu.menu:" + menu.menu);
        var hhmm = deliveryTime.slice(11, 13) + "시 " + deliveryTime.slice(14, 16) + "분";
        var min = parseInt(deliveryTime.slice(11, 13)) * 60 + parseInt(deliveryTime.slice(14, 16));
        var index = this.produceList.findIndex(function (val) {
            console.log("val.menu:" + JSON.stringify(val));
            if (val.menu == menu.menu) //Please update this....
                return true;
            else
                return false;
        });
        console.log("index:" + index);
        if (index < 0) {
            this.produceList.push({ menu: menu.menu, amount: [{ amount: amount + menu.unit, time: hhmm, min: min ,unit:menu.unit,amountNum:amount }] });
        }
        else {
            this.produceList[index].amount.push({ amount: amount + menu.unit, time: hhmm, min: min ,unit:menu.unit,amountNum:amount});
        }
        console.log("produceList:" + JSON.stringify(this.produceList));
    };
    
    addEtcMenuInList(menu, deliveryTime){
        var hhmm = deliveryTime.slice(11, 13) + "시 " + deliveryTime.slice(14, 16) + "분";
        var min = parseInt(deliveryTime.slice(11, 13)) * 60 + parseInt(deliveryTime.slice(14, 16));        
        this.etcProduceList.push({ menu: menu , time: hhmm, min: min });
    }

    configureProduceSection() {
        this.produceList = []; //[{menu:"단호박소담",amount:[{amount:"1kg",time:"03:00"}]}]
        this.etcProduceList=[];
        this.storageProvider.orderList.forEach( (order)=> {
            console.log("order.menuList: "+JSON.stringify(order.menuList));
            order.menuList.forEach( (menu) =>{
                if(menu.category=="기타"){
                    gHomePage.addEtcMenuInList(menu.menu, order.deliveryTime);
                }else if (menu.menu.indexOf("[") == 0) {
                    var menuObjs = JSON.parse(menu.menu);
                    menuObjs.forEach(function (menuObj) {
                        var key :any= Object.keys(menuObj);
                        var menuInput = { menu: key[0], unit: menu.unit };
                        var amount = Number(menuObj[key]) * Number(menu.amount);
                        console.log("amount:" + amount);
                        gHomePage.addMenuInList(menuInput, order.deliveryTime, amount);
                    });
                }else {
                    console.log("menu.menu:"+menu.menu);
                    gHomePage.addMenuInList(menu, order.deliveryTime, menu.amount); //Please update it!!!
                }
            });
        });
        console.log("produceList:" + JSON.stringify(this.produceList));
        console.log("etcProduceList:" + JSON.stringify(this.etcProduceList));
        
        //humm sort each menu with deliveryTime(?)   
        this.produceList.forEach((menu)=> {
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

        this.etcProduceList.sort(function (a, b) {
                if (a.min < b.min)
                    return -1;
                if (a.min > b.min)
                    return 1;
                return 0;
            });

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

    ////////////////////////////////////////
    // move into other pages
    adminPage(){
            this.navCtrl.push(ManagerEntrancePage);
    }

    trashPage(){
            this.navCtrl.push(TrashPage);
    }

    inputSearchKeyWord(){
        console.log("inputSearchKeyWord:"+this.searchKeyWord);

        if(!this.searchKeyWord) return;

        var searchKeyWord = this.searchKeyWord.trim();
        if ('0' <= searchKeyWord[0] && searchKeyWord[0] <= '9') {
            this.searchKeyWord = this.autoHypenPhone(searchKeyWord); // look for phone number
        }

        this.filter=this.storageProvider.orderList.filter(function(value){
            if('0'<=gHomePage.searchKeyWord[0] && gHomePage.searchKeyWord[0]<='9'){ //check digit
                    console.log(" "+value.buyerPhoneNumber+" "+gHomePage.searchKeyWord);
                    console.log(value.buyerPhoneNumber.startsWith(gHomePage.searchKeyWord));
                    return value.buyerPhoneNumber.startsWith(gHomePage.searchKeyWord);
            }else{
                    console.log(" "+value.buyerName+" "+gHomePage.searchKeyWord); 
                    console.log(value.buyerName.startsWith(gHomePage.searchKeyWord));               
                    return value.buyerName.startsWith(gHomePage.searchKeyWord);                
            }
        });
    }

    todayOrders(){
        var now = new Date().getTime();
        this.setDeliveryDate(now);

    }

  topRowStyles = {
    'border-style':'solid',
    'border-width':'1px',
    'border-color': 'darkgray'
  };

  otherRowStyles = {
    'border-left-style':'solid',
    'border-left-width':'1px',
    'border-left-color': 'darkgray',
    'border-right-style':'solid',
    'border-right-width':'1px',
    'border-right-color': 'darkgray',
    'border-bottom-style':'solid',
    'border-botoom-width':'1px',
    'border-bottom-color': 'darkgray'
  };

    rowStyles(k){
        if(k==0){
            return this.topRowStyles;
        }else
            return this.otherRowStyles;
    }
    //style="border-left:solid 1px darkgray;border-right:solid 1px darkgray;border-bottom:solid 1px darkgray;"
}
