import { Component,Input,NgZone,Output,EventEmitter,OnInit } from '@angular/core';
import { NavController,AlertController ,Platform} from 'ionic-angular';
import * as moment from 'moment';
import { InAppBrowser } from '@ionic-native/in-app-browser';

var gComponent;

/**
 * Generated class for the OrderComponent component.
 *
 * See https://angular.io/api/core/Component for more info on Angular
 * Components.
 */
@Component({
  selector: 'order',
  templateUrl: 'order.html'
})
export class OrderComponent implements OnInit {
 @Input('order') orderIn:any;
 @Input('menus') menus:any;

 @Output("output") output= new EventEmitter();

  categorySelected:number=-1;
  unit:string;
  amount:number;
  menuIndex:number=-1;

  priceString;
  deliveryFeeString;

  //paymentOption;  // ion-select가 custom component에서 초기화가 안된다. 왜그럴까? 
  //deliveryMethod;
  
  deliveryTimeUpdate; // 수정일 경우 다른 날짜인지를 판별하기 위해 필요함.

  order;

  browserRef;
  done:boolean=false;
  redirectUrl="http://www.takit.biz";

  constructor(public alertCtrl:AlertController
              ,private iab: InAppBrowser 
              ,public platform:Platform    
              ,private ngZone:NgZone) {
    gComponent=this;
  }

  ngOnInit() { 
    this.order = Object.assign({}, this.orderIn); // copy object. Very important!!!! 아주 중요하다. 입력값은 사용하지 않는다.
    this.deliveryTimeUpdate=this.order.deliveryTime;
    if(this.order.price)
        this.priceString=this.order.price.toLocaleString();
    if(this.order.deliveryFee)   
        this.deliveryFeeString=this.order.deliveryFee.toLocaleString();
    
    console.log('component initialized. order:'+JSON.stringify(this.order)); 
   // this.paymentOption=this.order.paymentOption; //workaround solution. 왜 ion-select의 ngModel값이 초기화가 안될까?
   // this.deliveryMethod=this.order.deliveryMethod;
   // console.log("this.deliveryMethod:"+this.deliveryMethod);
  }

  getJuso(){
    this.order.addressInputType="auto";
    this.order.recipientAddress="주소 선택";
    this.getJusoDaum();
  }

  manualInput(){
    this.order.addressInputType="manual";
    this.order.recipientAddress=""
  }

  orderCancel(){ //initialize and hide orderArea
    console.log("orderCancel comes");

    let confirm = this.alertCtrl.create({
      title: '입력을 취소합니다',
      buttons: [
        {
          text: '네',
          handler: () => {
            this.output.emit();
            return;
          }
        },
        {
          text: '아니오',
          handler: () => {
          }
        }
      ]
    });
    confirm.present();
  }

  receiverSameChange(){
    console.log("receiverSameChange");
    if(this.order.receiverSame){
      this.order.recipientPhoneNumber=this.order.buyerPhoneNumber;
      this.order.recipientName=this.order.buyerName;
    }else{
      if(this.order.recipientPhoneNumber==this.order.buyerPhoneNumber
          && this.order.recipientName==this.order.buyerName){
            this.order.recipientName="";
            this.order.recipientPhoneNumber="";
          }
    }
  }

  inputBuyerPhoneNumber(){
        let buyerPhoneNumber=this.order.buyerPhoneNumber.trim();
        this.order.buyerPhoneNumber=this.autoHypenPhone(buyerPhoneNumber); // look for phone number
  }

  inputRecipientPhoneNumber(){
        let recipientPhoneNumber=this.order.recipientPhoneNumber.trim();
        this.order.recipientPhoneNumber=this.autoHypenPhone(recipientPhoneNumber); // look for phone number
  }

  inputBuyerName(){
    console.log("inputBuyerName");
    if(this.order.receiverSame){
        this.order.recipientName=this.order.buyerName;
    }
  }

 reflectBuyerPhoneNumber(){
   if(this.order.receiverSame){
        this.order.recipientPhoneNumber=this.order.buyerPhoneNumber;
    }
 }

  sum(a,b){
    let total=0;
    if(a){
        total+=parseInt(a);
    }
    if(b){
        total+=parseInt(b);
    }
    return total.toLocaleString();
  }

  changeAddressInputType(type){
    this.order.addressInputType=type;
    this.order.recipientAddress="주소 선택";
    if(type=="auto"){
        this.getJusoDaum();
    }
  }


  selectCategory(){
    if(this.categorySelected==-1){
      console.log("categorySelected is -1. How can it happen?");
      return;
    }
    console.log("selectCategory:"+this.order.categorySelected);
    if(this.menus[this.categorySelected].menus.length==1){
          this.menuIndex=0;
    }
  }

  addMenu(){
    if(this.categorySelected==-1 ){
            let alert = this.alertCtrl.create({
              title: '종류를 선택해 주시기 바랍니다.',
              buttons: ['확인']
            });
            alert.present();
        return;
    }    
    if(this.menuIndex==-1 ){
            let alert = this.alertCtrl.create({
              title: '메뉴를 선택해 주시기 바랍니다.',
              buttons: ['확인']
            });
            alert.present();
        return;
    }    
    if(!this.amount || this.amount==0){
            let alert = this.alertCtrl.create({
              title: '수량을 선택해 주시기 바랍니다.',
              buttons: ['확인']
            });
            alert.present();
        return;
    }
    if(this.unit==undefined || this.unit.length==0){
            let alert = this.alertCtrl.create({
              title: '단위를 선택해 주시기 바랍니다.',
              buttons: ['확인']
            });
            alert.present();
        return;
    }
    if(this.menus[this.categorySelected].menuStrings[this.menuIndex]!=this.menus[this.categorySelected].menus[this.menuIndex]){
          if(this.unit!="개"){
              let alert = this.alertCtrl.create({
                title: '복합 메뉴의 단위는 개만 선택가능합니다.',
                buttons: ['확인']
              });
              alert.present();
              return;      
          }
    }    
    let menu={category:this.menus[this.categorySelected].category,
              menuString:this.menus[this.categorySelected].menuStrings[this.menuIndex],
              menu:this.menus[this.categorySelected].menus[this.menuIndex], 
              amount:this.amount, unit: this.unit}
    this.order.menuList.push(menu);              
    console.log("menu:"+JSON.stringify(menu));          
    this.categorySelected=-1;
    this.unit="";
    this.amount=null; //undefined doesn't work for initialization.
    this.menuIndex=-1;
  }

 removeMenu(i){
    this.order.menuList.splice(i,1);
 }

autoHypenPhone(str){
    str = str.replace(/[^0-9]/g, '');
    var tmp = '';

    if(str.length>=2 && str.startsWith('02')){
      tmp += str.substr(0, 2);
      tmp+='-';
      if(str.length<7){
        tmp+=str.substr(2);
      }else{
        tmp+=str.substr(2,3);
        tmp+='-';
        tmp+=str.substr(5);
      }
      return tmp;
    }else if( str.length < 4){
      return str;
    }else if(str.length < 7){
      tmp += str.substr(0, 3);
      tmp += '-';
      tmp += str.substr(3);
      return tmp;
    }else if(str.length < 11){
      tmp += str.substr(0, 3);
      tmp += '-';
      tmp += str.substr(3, 3);
      tmp += '-';
      tmp += str.substr(6);
      return tmp;
    }else{        
      tmp += str.substr(0, 3);
      tmp += '-';
      tmp += str.substr(3, 4);
      tmp += '-';
      tmp += str.substr(7);
      return tmp;
    }
  }

  save(){

    if(this.order.addressInputType=="unknown"){
      let alert = this.alertCtrl.create({
        title: '주소 형식을 선택해주세요.',
        buttons: ['확인']
      });
      alert.present();
      return ;
    }

    if(this.order.addressInputType=="auto" && (!this.order.recipientAddressDetail || this.order.recipientAddressDetail.trim().length==0)){
      let alert = this.alertCtrl.create({
        title:'상세주소를 입력하세요.',
        buttons: ['확인']
      });
      alert.present();
      return ;
    }

    if(this.order.addressInputType=="manual" && (!this.order.recipientAddress || this.order.recipientAddress.trim().length==0)){
      let alert = this.alertCtrl.create({
        title:'주소를 입력하세요.',
        buttons: ['확인']
      });
      alert.present();
      return ;
    }

    if(!this.order.recipientName ||(this.order.recipientName.trim().length==0)){
      let alert = this.alertCtrl.create({
        title: '받는사람 이름을 입력하세요.',
        buttons: ['확인']
      });
      alert.present();
      return ;
    }

    if(!this.order.recipientPhoneNumber || this.order.recipientPhoneNumber.trim().length==0){
      let alert = this.alertCtrl.create({
        title: '받는사람 전화번호를 입력하세요.',
        buttons: ['확인']
      });
      alert.present();
      return ;
    }

    if(!this.order.buyerName || this.order.buyerName.trim().length==0){
      let alert = this.alertCtrl.create({
        title: '구매자 이름을 입력하세요.',
        buttons: ['확인']
      });
      alert.present();
      return ;
    }
   
    if(!this.order.buyerPhoneNumber || this.order.buyerPhoneNumber.trim().length==0){
      let alert = this.alertCtrl.create({
        title: '구매자 전화번호를 입력하세요.',
        buttons: ['확인']
      });
      alert.present();
      return ;
    }

    if(this.order.menuList==undefined || this.order.menuList.length==0){
      let alert = this.alertCtrl.create({
        title: '떡 종류를 선택하세요. (떡 종류 / 수량 / 단위 선택 후 떡 추가 버튼 누르기)',
        buttons: ['확인']
      });
      alert.present();
      return ;
    }

    if(this.order.price == undefined || this.order.price==0){
      let alert = this.alertCtrl.create({
        title: '가격을 입력하세요.',
        buttons: ['확인']
      });
      alert.present();
      return ;
    }

    if(!this.order.deliveryMethod){
      let alert = this.alertCtrl.create({
        title: '배송방법을 선택하세요.',
        buttons: ['확인']
      });
      alert.present();
      return ;
    }

    if(!this.order.paymentOption){
      let alert = this.alertCtrl.create({
        title: '결제 수단/방법을 선택하세요.',
        buttons: ['확인']
      });
      alert.present();
      return ;
    }
    
    //this.order.paymentOption=this.paymentOption;//workaround solution
    //this.order.deliveryMethod=this.deliveryMethod;//workaround solution

    switch(this.order.paymentOption){
      case "cash-pre":   this.order.paymentMethod="cash"; this.order.payment="unpaid-pre"; this.order.paymentString="현금-선불"; break;
      case "cash-after": this.order.paymentMethod="cash"; this.order.payment="unpaid-after";this.order.paymentString="현금-후불";break;
      case "cash-paid": this.order.paymentMethod="cash"; this.order.payment="paid";this.order.paymentString="현금-완납";break;      
      case "card-pre":   this.order.paymentMethod="card"; this.order.payment="unpaid-pre";this.order.paymentString="카드-선불";break;
      case "card-after":  this.order.paymentMethod="card"; this.order.payment="unpaid-after";this.order.paymentString="카드-후불";break;
      case "card-paid":  this.order.paymentMethod="card"; this.order.payment="paid";this.order.paymentString="카드-완납";break;
    }
    if(this.order.id){
        if(this.deliveryTimeUpdate.substr(0,10)!=this.order.deliveryTime.substr(0,10)){
            this.order.diffDate=true;          
        }else
            this.order.diffDate=false;
        this.order.deliveryTime=this.deliveryTimeUpdate; 
    }
    this.order.price=parseInt(this.order.price);
    if(this.order.deliveryFee){
        this.order.deliveryFee=parseInt(this.order.deliveryFee);      
        this.order.totalPrice=this.order.price+this.order.deliveryFee;
    }else{
        this.order.deliveryFee=0;
        this.order.totalPrice=this.order.price;
    }
    if(!this.order.recipientAddressDetail || this.order.addressInputType=="manual"){
        this.order.recipientAddressDetail="   "; //initialize it with blank string.
    }
    console.log("total:"+this.order.totalPrice+" price:"+this.order.price+" deliveryFee:"+this.order.deliveryFee);
    this.output.emit(this.order);
  }

    getJusoDaum(){
        console.log("call daum API");
        let localfile;
        this.done=false;

        if(this.platform.is('android')){
            console.log("android");
            localfile='file:///android_asset/www/assets/address.up.html';
        }else if(this.platform.is('ios')){
            console.log("ios");
            localfile='assets/address.up.html';
        }       
        this.browserRef=this.iab.create(localfile,"_blank" ,'toolbarposition=top,location=no,presentationstyle=formsheet,closebuttoncaption=종료');

            this.browserRef.on("loadstart").subscribe((e) =>{
            console.log("e.url:"+e.url);
            if (e.url.startsWith(this.redirectUrl)) {
                let url=decodeURI(e.url);
                let address=url.substring(this.redirectUrl.length+1);
                this.ngZone.run(()=>{
                    this.order.recipientAddress=address;
                    console.log("address:"+decodeURI(address));                    
                });
                gComponent.done=true;            
                gComponent.browserRef.close();
            }
            });

            this.browserRef.on("exit").subscribe( (e) => {
            });
    }

/*
  updatePaymentOption(value){
    console.log("updatePaymentOption:"+value);
    this.paymentOption=value; //왜 order.paymentOption에 값이 저장되지 않을까?
  }
*/  

inputPrice(){
    console.log("inputPrice ");
    if(this.priceString){
        let numberString=this.priceString.replace(/,/gi, "");
        let number=parseInt(numberString);
        console.log("boolean:"+(parseInt(numberString).toString()==="NaN"));
        if(parseInt(numberString)==NaN || numberString.length==0){
            number=0;
        }
        console.log("[inputPrice]number:"+number+"priceString"+this.priceString);
        this.priceString=number.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
    }else{
      this.priceString="";
    }
  }

  inputDeliveryFee(){
    if(this.deliveryFeeString){
        let numberString=this.deliveryFeeString.replace(/,/gi, "");
        let number=parseInt(numberString);
        if(numberString.length==0 ||parseInt(numberString)==NaN)
            number=0;
        this.deliveryFeeString=number.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
    }else{
      this.deliveryFeeString="";
    }
  }

computeTotal(){
    console.log("computeTotal price:"+this.priceString+" deliveryFee: "+ this.deliveryFeeString);
    if(this.priceString && this.priceString.length>0){
        let numberString=this.priceString.replace(/,/gi, "");
        let number=parseInt(numberString);
        console.log("number:"+number+"priceString"+this.priceString);
        this.order.price=number;      
    }else{
        this.order.price=0;
        console.log("price is :"+this.order.price);
    }
    if(this.deliveryFeeString && this.deliveryFeeString.length>0){
        let numberString=this.deliveryFeeString.replace(/,/gi, "");
        let number=parseInt(numberString);
        if(numberString.length==0)
            number=0;
        this.order.deliveryFee=number;              
    }else{
        this.order.deliveryFee=0;
    } 
    console.log("deliveryFee: "+this.order.deliveryFee);
    console.log("price: "+this.order.price);

    return this.sum(this.order.deliveryFee,this.order.price);
}
}
