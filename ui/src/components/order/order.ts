import { Component,Input,NgZone,Output,EventEmitter,OnInit } from '@angular/core';
import { NavController,AlertController } from 'ionic-angular';
import * as moment from 'moment';

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
  package:string;

  paymentOption;  // ion-select가 custom component에서 초기화가 안된다. 왜그럴까? 
  deliveryMethod;
  deliveryTimeUpdate; //왜 ngModel이 동작하지 않는가???
  addressInputType;
  order;
  choices=[];
  choiceOptions=[];
  choiceOption=[];
  priceString;
  deliveryFeeString;
  etc:string; //기타 

  browserRef;
  done:boolean=false;
  redirectUrl="http://www.takit.biz";

  constructor(public alertCtrl:AlertController
              ,private ngZone:NgZone) {
    gComponent=this;
  }

  ngOnInit() { 
   this.order = Object.assign({}, this.orderIn); // copy object. Very important!!!! 아주 중요하다. 입력값은 사용하지 않는다.
   if(this.order.price)
       this.priceString=this.order.price.toLocaleString();
   if(this.order.deliveryFee)   
       this.deliveryFeeString=this.order.deliveryFee.toLocaleString();

   this.addressInputType=this.order.addressInputType;
    console.log('component initialized. order:'+JSON.stringify(this.order)); 
    this.paymentOption=this.order.paymentOption; //workaround solution. 왜 ion-select의 ngModel값이 초기화가 안될까?
    this.deliveryMethod=this.order.deliveryMethod;
    this.deliveryTimeUpdate=this.order.deliveryTime;
    console.log("this.deliveryMethod:"+this.deliveryMethod);
  }

  getJuso(){
    this.order.addressInputType="auto";
  }

  manualInput(){
    this.order.addressInputType="manual";
    this.order.recipientAddress="";
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
      console.log("!!!!this.order.addressInputType:"+this.order.addressInputType);
  }


  selectCategory(){
    if(this.categorySelected==-1){
      console.log("categorySelected is -1. How can it happen?");
      return;
    }
    if(this.categorySelected==-2){
      return;
    }
    console.log("selectCategory:"+this.categorySelected);
    if(this.menus[this.categorySelected].menus.length==1){
          this.menuIndex=0;
    }
    if(this.menus[this.categorySelected].type.startsWith("complex")){
        this.unit="개";
    }
    if(this.menus[this.categorySelected].type=="complex-choice"){
          this.choices=[];
          let choiceNumber=this.menus[this.categorySelected].menus[0].choiceNumber;
          for(let i=0;i<choiceNumber;i++)
              this.choices.push({option:"",index:-1});
          let choiceOption=[];
          let menus=JSON.parse(this.menus[this.categorySelected].menus[0].menu);          
          menus.forEach((option)=>{
              console.log("option:"+option);
              let menuString="";
              let key:any=Object.keys(option);
               menuString+=key+option[key]+" ";
               choiceOption.push(menuString);
          })
          console.log("choiceOptions:"+JSON.stringify(choiceOption));
          this.choiceOption=choiceOption;
          for(let i=0;i<choiceNumber;i++)
            this.choiceOptions.push(choiceOption);
    }
  }

  onInput(ev,i){
    let val = ev.target.value;

    if (val && val.trim() !== '') {
      console.log("value:"+val+'len:'+val.length);
      if(val.length>=1)
      this.choiceOptions[i] = this.choiceOption.filter(function(menu) {
        return menu.toLowerCase().includes(val.toLowerCase());
      });
    }
  }
  selectChoice(val,i){
    this.choices[i].option=val;
    this.choiceOptions[i]=[];
  }
/*
  selectChoice(i){
    console.log(" choices:"+JSON.stringify(this.choices));
  }
*/
  addMenu(){
    if(this.categorySelected==-1 ){
            let alert = this.alertCtrl.create({
              title: '종류를 선택해 주시기 바랍니다.',
              buttons: ['확인']
            });
            alert.present();
        return;
    }  

    if(this.categorySelected==-2){
      if(!this.etc ||this.etc.trim().length==0){
            let alert = this.alertCtrl.create({
              title: '메뉴를 입력해 주시기 바랍니다.',
              buttons: ['확인']
            });
            alert.present();
            return;
      }
      let menu={category:"기타", menuString:this.etc, menu:this.etc};

      this.order.menuList.push(menu);              
      console.log("menu:"+JSON.stringify(menu));          
      this.categorySelected=-1;
      this.etc="";
      return;
    }

   if(this.menus[this.categorySelected].type!="complex-choice" ){
        if(this.menuIndex==-1 ){
                let alert = this.alertCtrl.create({
                  title: '메뉴를 선택해 주시기 바랍니다.',
                  buttons: ['확인']
                });
                alert.present();
            return;
        }    
        if(!this.package || this.package.length ==0){
                let alert = this.alertCtrl.create({
                  title: '포장을 선택해 주시기 바랍니다.',
                  buttons: ['확인']
                });
                alert.present();
                return;
        }
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
    if(this.menus[this.categorySelected].type.startsWith("complex")){
          if(this.unit!="개"){
              let alert = this.alertCtrl.create({
                title: '복합 메뉴의 단위는 개만 선택가능합니다.',
                buttons: ['확인']
              });
              alert.present();
              return;      
          }
    }
    
    console.log("..."+this.menus[this.categorySelected].type);
    console.log("bool:"+this.menus[this.categorySelected].type=="complex-choice");
    if(this.menus[this.categorySelected].type=="complex-choice"){ //각 선택 메뉴가 정확한지 확인한다.
        for(let j=0;j<this.choices.length;j++){
            if(this.choices[j].option.trim().length==0){
                let alert = this.alertCtrl.create({
                  title: (j+1)+'번째 메뉴를 입력해주세요.',
                  buttons: ['확인']
                });
                alert.present();
                return;      
            }
            let i=0;
            for(i=0;i<this.choiceOption.length;i++){
                  if(this.choiceOption[i]==this.choices[j].option){
                      this.choices[j].index=i;
                      break;
                  }
            }
            if(i==this.choiceOption.length){
              let alert = this.alertCtrl.create({
                title: this.choices[j].option+'은 선택가능한 옵션이 아닙니다.',
                buttons: ['확인']
              });
              alert.present();
              return;      
            }
        }
    } 

   let menuStringWithPackage="";
   let menuWithPackage;

    if(this.menus[this.categorySelected].type=="complex-choice"){
                console.log("this.menus[this.categorySelected]:"+JSON.stringify(this.menus[this.categorySelected]));
                let menus=JSON.parse(this.menus[this.categorySelected].menus[0].menu);          
                let menuObjsWithPackage=[];
                for(let i=0;i<this.choices.length ;i++){
                   menuObjsWithPackage.push(menus[this.choices[i].index]);
                   let menuObj=menus[this.choices[i].index];
                   let key:any=Object.keys(menuObj)[0];
                   menuStringWithPackage+=key+menuObj[key]+" ";//표기될 메뉴 문자열
                }
                menuWithPackage=JSON.stringify(menuObjsWithPackage); //저장될 객체의 문자열
    }else if(this.menus[this.categorySelected].type=="complex"){ //복합메뉴
                console.log("menu:"+ this.menus[this.categorySelected].menus[this.menuIndex]);
                let menuObjs=JSON.parse(this.menus[this.categorySelected].menus[this.menuIndex].menu);
                let menuObjsWithPackage=[];
                menuObjs.forEach(menuObj=>{
                   let key:any=Object.keys(menuObj)[0];
                   console.log("key:"+key);
                   menuStringWithPackage+=key+"("+this.package+")"+menuObj[key]+" ";
                   let keyName:string=key+"("+this.package+")";
                   let object={};
                   object[keyName]=menuObj[key];
                   menuObjsWithPackage.push(object);
                });
                menuWithPackage=JSON.stringify(menuObjsWithPackage);
    }else{ //단일 메뉴
        menuWithPackage=this.menus[this.categorySelected].menus[this.menuIndex].menuString+"("+this.package+")";
        menuStringWithPackage=menuWithPackage;
    }
    console.log("menuWithPackage:"+menuWithPackage);
    console.log("menuStringWithPackage:"+menuStringWithPackage);

  let menu={category:this.menus[this.categorySelected].category,
              menuString:menuStringWithPackage,
              menu:menuWithPackage, 
              amount:this.amount, unit: this.unit}

    this.order.menuList.push(menu);              
    console.log("menu:"+JSON.stringify(menu));          
    this.categorySelected=-1;
    this.unit="";
    this.amount=null; //undefined doesn't work for initialization.
    this.menuIndex=-1;
    this.package="";
    this.choices=[];
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

    if(!this.order.recipientName){
      let alert = this.alertCtrl.create({
        title: '받는사람 이름을 입력하세요.',
        buttons: ['확인']
      });
      alert.present();
      return ;
    }

    if(!this.order.recipientPhoneNumber){
      let alert = this.alertCtrl.create({
        title: '받는사람 전화번호를 입력하세요.',
        buttons: ['확인']
      });
      alert.present();
      return ;
    }

    if(!this.order.buyerName){
      let alert = this.alertCtrl.create({
        title: '구매자 이름을 입력하세요.',
        buttons: ['확인']
      });
      alert.present();
      return ;
    }
   
    if(!this.order.buyerPhoneNumber){
      let alert = this.alertCtrl.create({
        title: '구매자 전화번호를 입력하세요.',
        buttons: ['확인']
      });
      alert.present();
      return ;
    }

    if(this.order.menuList==undefined || this.order.menuList.length==0){
        this.addMenu();        
    }

    if(this.order.menuList==undefined || this.order.menuList.length==0){
      let alert = this.alertCtrl.create({
        title: '주문 떡 메뉴를 입력해주세요.',
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

    if(!this.deliveryMethod){
      let alert = this.alertCtrl.create({
        title: '배송방법을 선택하세요.',
        buttons: ['확인']
      });
      alert.present();
      return ;
    }

    if(!this.paymentOption){
      let alert = this.alertCtrl.create({
        title: '결제 수단/방법을 선택하세요.',
        buttons: ['확인']
      });
      alert.present();
      return ;
    }
    
    this.order.paymentOption=this.paymentOption;//workaround solution
    this.order.deliveryMethod=this.deliveryMethod;//workaround solution
    this.order.deliveryTimeUpdate=this.deliveryTimeUpdate //workaround solution. Why? 뭔가를 더 해줘야 하는가?

    switch(this.order.paymentOption){
      case "cash-pre":   this.order.paymentMethod="cash"; this.order.payment="unpaid-pre"; this.order.paymentString="현금-선불"; break;
      case "cash-after": this.order.paymentMethod="cash"; this.order.payment="unpaid-after";this.order.paymentString="현금-후불";break;
      case "cash-paid": this.order.paymentMethod="cash"; this.order.payment="paid";this.order.paymentString="현금-완납";break;      
      case "card-pre":   this.order.paymentMethod="card"; this.order.payment="unpaid-pre";this.order.paymentString="카드-선불";break;
      case "card-after":  this.order.paymentMethod="card"; this.order.payment="unpaid-after";this.order.paymentString="카드-후불";break;
      case "card-paid":  this.order.paymentMethod="card"; this.order.payment="paid";this.order.paymentString="카드-완납";break;
    }
    let deliveryTime:string=this.order.deliveryTime;
    deliveryTime=deliveryTime.substr(0,16)+":00.000Z"; //dynamoDB format으로 변경한다.
    console.log("deliveryTime:"+deliveryTime);
    this.order.deliveryTime=deliveryTime;
    if(this.order.id){
        if(this.deliveryTimeUpdate.substr(0,10)!=this.order.deliveryTime.substr(0,10)){
            this.order.diffDate=true;          
        }else
            this.order.diffDate=false;
        this.order.deliveryTimeUpdate=this.deliveryTimeUpdate.substr(0,16)+":00.000Z"; //dynamoDB format으로 변경한다.
    }
    this.order.price=parseInt(this.order.price);
    if(this.order.deliveryFee){
        this.order.deliveryFee=parseInt(this.order.deliveryFee);      
        this.order.totalPrice=this.order.price+this.order.deliveryFee;
    }else{
        this.order.deliveryFee=0;
        this.order.totalPrice=this.order.price;
    }
    if(!this.order.recipientAddressDetail || this.addressInputType=="manual"){
        this.order.recipientAddressDetail="   "; //initialize it with blank string.
    }
    console.log("total:"+this.order.totalPrice+" price:"+this.order.price+" deliveryFee:"+this.order.deliveryFee);
    this.output.emit(this.order);
  }


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
    //console.log("computeTotal price:"+this.priceString+" deliveryFee: "+ this.deliveryFeeString);
    if(this.priceString && this.priceString.length>0){
        let numberString=this.priceString.replace(/,/gi, "");
        let number=parseInt(numberString);
        //console.log("number:"+number+"priceString"+this.priceString);
        this.order.price=number;      
    }else{
        this.order.price=0;
        //console.log("price is :"+this.order.price);
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
    //console.log("deliveryFee: "+this.order.deliveryFee);
    //console.log("price: "+this.order.price);

    return this.sum(this.order.deliveryFee,this.order.price);
}

changeManual(){
    this.order.addressInputType="manual";
    if(this.order.recipientAddress=="주소 선택"){
        this.order.recipientAddress="";
    }
    this.order.recipientAddressDetail="";
}
/*
  updatePaymentOption(value){
    console.log("updatePaymentOption:"+value);
    this.paymentOption=value; //왜 order.paymentOption에 값이 저장되지 않을까?
  }
*/  
}
