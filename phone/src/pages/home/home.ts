import { Component } from '@angular/core';
import { NavController,AlertController,Platform,LoadingController } from 'ionic-angular';
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
            page=this.constructOrderPrint();
        }else if(this.section == 'delivery'){
            page=this.constructDeliveryPrint();
        }else if(this.section == 'produce'){
            console.log("produce print");
            page=this.constructProducePrint();
        }else if(this.section =='set'){
            console.log("produce set");
            page=this.constructSetPrint();            
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

    constructSetPrint(){
        let rightCharacters:number=22;
        let leftCharacters:number=13;
        let linesPerPage=25; 
        let title=this.storageProvider.deliveryDate.substr(0,4)+"년"+
                      this.storageProvider.deliveryDate.substr(5,2)+"월"+
                      this.storageProvider.deliveryDate.substr(8,2)+"일"+this.storageProvider.deliveyDay;
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
            pages+=this.storageProvider.deliveryDate.substr(0,4)+"년"+
                      this.storageProvider.deliveryDate.substr(5,2)+"월"+
                      this.storageProvider.deliveryDate.substr(8,2)+"일"+this.storageProvider.deliveyDay+"("+(index+1)+"/"+pageNumber+")"+"</H1>";
                      
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
        let title=this.storageProvider.deliveryDate.substr(0,4)+"년"+
                      this.storageProvider.deliveryDate.substr(5,2)+"월"+
                      this.storageProvider.deliveryDate.substr(8,2)+"일"+this.storageProvider.deliveyDay;
        let currentPage=1;
        let currentLines=0;
        let eachItems=[];
        let totalLinesNumber=0;
        console.log("constrcutProducePrint");
        this.storageProvider.produceList.forEach(item=>{
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
            pages+=this.storageProvider.deliveryDate.substr(0,4)+"년"+
                      this.storageProvider.deliveryDate.substr(5,2)+"월"+
                      this.storageProvider.deliveryDate.substr(8,2)+"일"+this.storageProvider.deliveyDay+"("+(index+1)+"/"+pageNumber+")"+"</H1>";
                      
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

        let title="배달일:"+this.storageProvider.deliveryDate.substr(0,4)+"년"+
                      this.storageProvider.deliveryDate.substr(5,2)+"월"+
                      this.storageProvider.deliveryDate.substr(8,2)+"일"+this.storageProvider.deliveyDay+" 총:"+this.storageProvider.orderList.length+" ";

        let eachPages=[]; // tables(order,addressPrint, menusPrint, memoPrint) per page,pageNumber
        let eachTables=[];
        let totalLinesNumber=0;
        let defaultLinesNumber=4; 

        this.storageProvider.orderList.forEach(item=>{
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
pages+="<span>"+tableNumber+"/"+this.storageProvider.orderList.length+"</span><br>\n";
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

   let defaultTitle="배달일:"+this.storageProvider.deliveryDate.substr(0,4)+"년"+
                      this.storageProvider.deliveryDate.substr(5,2)+"월"+
                      this.storageProvider.deliveryDate.substr(8,2)+"일"+this.storageProvider.deliveyDay;

   let index=0;
   let pageBreakFirst:boolean=false;
   for(index=0;index<this.storageProvider.assignOrderList.length;index++){
       console.log("hum...storageProvider.assignOrderList[index].orders");
       if(this.storageProvider.assignOrderList[index].orders.length==0){ 
           continue;
       }else{
            let title;
            title=defaultTitle+"("+ this.storageProvider.assignOrderList[index].name+")";
            pages+=this.printPages(title,this.storageProvider.assignOrderList[index].orders,pageBreakFirst);
            pageBreakFirst=true;

       }
   }

   let title;
   if(this.storageProvider.unassingOrderDeliveryList.length>0){
        title=defaultTitle+" 배송 ";
        pages+=this.printPages(title,this.storageProvider.unassingOrderDeliveryList,pageBreakFirst);
        pageBreakFirst=true;
   }
   if(this.storageProvider.unassingOrderFrozenList.length>0){
        title=defaultTitle+" 냉동 ";
        pages+=this.printPages(title,this.storageProvider.unassingOrderFrozenList,pageBreakFirst);
        pageBreakFirst=true;
   }
   if(this.storageProvider.unassingOrderPickupList.length>0){
        title=defaultTitle+" 픽업 ";
        console.log("pageBreakFirst:"+pageBreakFirst);
        pages+=this.printPages(title,this.storageProvider.unassingOrderPickupList,pageBreakFirst);
        pageBreakFirst=true;
   }
   if(this.storageProvider.unassingOrderEtcList.length>0){
        title=defaultTitle+" 기타 ";
        pages+=this.printPages(title,this.storageProvider.unassingOrderEtcList,pageBreakFirst);
        pageBreakFirst=true;
   }
   pages+="</html>";
   return pages;
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

///////////////////////////////////////////////////////
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

}
