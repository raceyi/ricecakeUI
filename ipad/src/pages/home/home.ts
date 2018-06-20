import { Component } from '@angular/core';
import { IonicPage,NavController,AlertController,Platform,LoadingController } from 'ionic-angular';
import {StorageProvider} from "../../providers/storage/storage";
import {ServerProvider} from "../../providers/server/server";
import {CarrierManagementPage} from "../carrier-management/carrier-management";
import {ConfigProvider} from "../../providers/config/config";

import {ManagerEntrancePage} from '../manager-entrance/manager-entrance';
import {TrashPage} from '../trash/trash';

import { BackgroundMode } from '@ionic-native/background-mode';
import { Push, PushObject, PushOptions } from '@ionic-native/push';
import { Printer, PrintOptions } from '@ionic-native/printer'
import { Events } from 'ionic-angular';

import * as moment from 'moment';
var gHomePage;

@IonicPage()
@Component({
  selector: 'page-home',
  templateUrl: 'home.html'
})
export class HomePage {
    section:string;
    filter=[];

    //newOrderInputShown;
    
    searchKeyWord;
    newOrder;

     constructor(public navCtrl:NavController, 
                    public alertCtrl:AlertController, 
                    private platform: Platform,
                    private push: Push,
                    private printer: Printer,  
                    public events: Events,  
                    public loadingCtrl: LoadingController,                                                                
                    private backgroundMode:BackgroundMode,
                    public serverProvider:ServerProvider,
                    public configProvider:ConfigProvider, 
                    public storageProvider:StorageProvider) {
        gHomePage=this;
        this.section = "order";
        this.storageProvider.newOrderInputShown = false;
        this.storageProvider.reconfigureDeliverySection();
/*
        this.platform.ready().then(() => {
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
        });
*/
        events.subscribe('update', (tablename) => {
            console.log("homePage receive update event");
            /*
            let alert = this.alertCtrl.create({
                            title: '주문정보가 변경되었습니다.',
                            buttons: ['확인']
                        });
                        alert.present();
             */              
         //this.storageProvider.refresh();
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
    
    getISO8601Format(milliseconds) {
        var d = new Date(milliseconds);
        var mm = d.getMonth() < 9 ? "0" + (d.getMonth() + 1) : (d.getMonth() + 1); // getMonth() is zero-based
        var dd = d.getDate() < 10 ? "0" + d.getDate() : d.getDate();
        var hh = d.getHours() < 10 ? "0" + d.getHours() : d.getHours();
        var min = d.getMinutes() < 10 ? "0" + d.getMinutes() : d.getMinutes();
        return d.getFullYear() + '-' + (mm) + '-' + dd + 'T' + hh + ":" + min + moment().format("Z");
    };
    
    orderSection() {
        this.section = 'order';
    };

    deliverySection() {
        this.storageProvider.reconfigureDeliverySection();
        this.section = 'delivery';
    };

    produceSection() {
        this.section = 'produce';
        this.storageProvider.configureProduceSection();
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
          //  console.log("deliveryDate:" + this.storageProvider.deliveryDate);
          //  var deliveryDate = new Date(this.storageProvider.deliveryDate);
          //  deliveryDate.setHours(0);
          //  deliveryDate.setMinutes(0);
          //  deliveryDate.setSeconds(0);
          //  deliveryDate.setMilliseconds(0);
          //  order.deliveryTime = this.getISO8601Format(deliveryDate.getTime()); //새주문 입력시 배달시간
          //  console.log("new order deliveryTime:"+order.deliveryTime);
        }else{
            order.deliveryTime= order.deliveryTime; 
            console.log("deliveryTime is "+order.deliveryTime+" in modification");
        }
        return order;
    };

    createNewOrder() {
        //1. initalize values for new order, <order>를 호출하기 전에 해당 변수들을 모두 초기화해줘야 함.
        this.newOrder = this.configureOrderInput({});
        //2. show order input area
        this.storageProvider.newOrderInputShown = true;
    };


    savePayment(order){
        console.log("savePayment-order:"+JSON.stringify(order));
        if(order.paymentMethod=="cash"){
            order.payment="paid-after";
        }else if(order.paymentMethod=="card"){
            order.payment="paid"; 
        }         
        this.storageProvider.updateOrder(order).then(()=>{///
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

   updateOrdrFunc(order, existing){
        this.storageProvider.updateOrder(order).then(()=>{///
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
                                            this.storageProvider.setDeliveryDate(order.deliveryTime);
                                            this.storageProvider.refresh("order");
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
                                            this.storageProvider.setDeliveryDate(order.deliveryTime);
                                            this.storageProvider.refresh("order");
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
    
    saveOrder (order, existing) {
        console.log("saveOrder-output:" + JSON.stringify(order));
        if (order == undefined && existing == undefined) {
            console.log("cancel order creation");
            this.storageProvider.newOrderInputShown = false;
            return;
        }else if (order == undefined && existing) {
            console.log("cancel order modification");
            existing.modification = false;
            return;
        }

        if (order.id == undefined) {
            console.log("order creation " + JSON.stringify(order));
            //save order in DB by calling server API. 
            this.storageProvider.saveOrder(order).then(()=>{///
                this.storageProvider.newOrderInputShown = false;
            },err=>{
                console.log("err:"+JSON.stringify(err));
                if(typeof err==="string" && err.indexOf("SMS-")>=0){
                    let alert = this.alertCtrl.create({
                        title: '문자발송에 실패했습니다.',
                        buttons: ['확인']
                    });
                    alert.present();
                    this.storageProvider.newOrderInputShown=false;
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

    modifyOrder(input) {
        if(input.operation=="delete"){
             let alert = this.alertCtrl.create({
                    title: '주문을 삭제하시겠습니까?',
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
                                this.storageProvider.hideOrder(input.order.id);
                                return;
                            }
                            }]
                });
                alert.present();
        }else if(input.operation=="modify"){
            input.order.modification = true;
        }
    };
    /////////////////////////////////////////////////////////
    //   Delivery section - begin
    assingCarrier(order) {
        //please Update carrier, sort order list again
        this.storageProvider.assignCarrier(order.id,order.carrier).then(()=>{
            this.storageProvider.refresh("order");
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
        this.storageProvider.assignCarrier(order.id,order.updateCarrier).then(()=>{
            this.storageProvider.refresh("order");
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

    manageCarrier() {
        this.navCtrl.push(CarrierManagementPage);
    };
    
    ////////////////////////////////////////
    // move into other pages
    adminPage(){
            this.navCtrl.push(ManagerEntrancePage);
    }

    trashPage(){
            this.navCtrl.push(TrashPage);
    }

    lookForMenu(keyword){
        let output=[];
        console.log("lookForMenu:"+keyword);
        this.storageProvider.orderList.forEach(order=>{
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
        if(this.filter.length==0){
            //메뉴에서 검색
             this.filter=this.lookForMenu(this.searchKeyWord);
        } 
    }

/*
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
*/

    refresh(){
        /*
          let progressBarLoader = this.loadingCtrl.create({
            content: "진행중입니다.",
            duration: 5*1000
        });
          progressBarLoader.present();        
        this.storageProvider.refresh("order").then(()=>{
              progressBarLoader.dismiss();
        },err=>{
              progressBarLoader.dismiss();
        });
        */
        console.log("refresh come");
        this.storageProvider.refresh("order");
        this.storageProvider.refresh("menu");
        this.storageProvider.refresh("carrier");
    }

    print(){
        let page;
        if(this.section == 'order'){
            page=this.storageProvider.constructOrderPrint();
        }else if(this.section == 'delivery'){
            page=this.storageProvider.constructDeliveryPrint();
        }else if(this.section == 'produce'){
            console.log("produce print");
            page=this.storageProvider.constructProducePrint();
        }else if(this.section =='set'){
            console.log("produce set");
            page=this.storageProvider.constructSetPrint();            
        }
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
    'border-bottom-width':'1px',
    'border-bottom-color': 'darkgray'
  };

    rowStyles(k){
        if(k==0){
            return this.topRowStyles;
        }else
            return this.otherRowStyles;
    }


   setSection(){
       this.section="set";
       this.configureSetSection();
   }
  setTable=[];

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
    console.log("order:"+JSON.stringify(this.storageProvider.orderList));

    this.setTable=[];
    this.storageProvider.orderList.forEach( (order)=>{
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
///////////////////////////////////////////////////////

    sortOrdersDeliveryTime(){
        this.storageProvider.sortType="delivery";
        this.storageProvider.orderList.sort(function(a,b){
            let a_delivery=new Date(a.deliveryTime);
            let b_delivery=new Date(b.deliveryTime);
            if (a_delivery.getTime() < b_delivery.getTime()) return -1;
            if (a_delivery.getTime() > b_delivery.getTime()) return 1;
            return 0;
        } );
    }

    sortOrdersInputTime(){
        this.storageProvider.sortType="input";
        this.storageProvider.orderList.sort(function(a,b){
            if (a.id < b.id) return -1;
            if (a.id > b.id) return 1;
            return 0;
        } );
    }

  save(group){
    group.edit=false;
    //produceTitle에 저장하여 전송한다. 현재값이 있다면 override한다. 
    console.log("produceTitle:"+JSON.stringify(this.storageProvider.produceTitle)+ this.storageProvider.produceTitle.length);
   
   let index=-1;
   for(let i=0;i<this.storageProvider.produceTitle.length;i++){
        if(this.storageProvider.produceTitle[i].number==group.digit){
            index=i;
        }
   }
   /* Why this doesn't work?
    let index=this.storageProvider.produceTitle.findIndex(function(element){
       return (element.number==group.digit);
    })
    */
    let prevName;
    let list=this.storageProvider.produceTitle.slice(); //Is it deep copy?yes
     
    if(index>=0){
        prevName=this.storageProvider.produceTitle[index].name;
        list[index].name=group.name;
    }else
        list.push({number:group.digit,name:group.name})
    this.serverProvider.saveProduceTitle(this.storageProvider.deliveryDate.substr(0,10),JSON.stringify(list)).then((list)=>{
        // 성공한다면 produceTitle을 업데이트한다.
        if(index>=0)
            this.storageProvider.produceTitle[index].name=group.name;
        else
            this.storageProvider.produceTitle.push({number:group.digit,name:group.name});
    },err=>{
        // 실패한다면 alert을 띄우고 값을 이전값으로 설정한다.
        if(index>=0)
            group.name=prevName;
        let alert = this.alertCtrl.create({
            title: '타이틀 변경에 실패하였습니다.',
            buttons: ['확인']
          });
          alert.present();
          return;

    });  
}

 edit(group){
    group.edit=true;
 }

}
