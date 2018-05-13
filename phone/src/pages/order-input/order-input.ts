import { Component ,NgZone,ViewChild} from '@angular/core';
import { IonicPage, NavController, NavParams ,Platform,AlertController} from 'ionic-angular';
import { StorageProvider } from '../../providers/storage/storage';
import { InAppBrowser } from '@ionic-native/in-app-browser';

/**
 * Generated class for the OrderInputPage page.
 *
 * See https://ionicframework.com/docs/components/#navigation for more info on
 * Ionic pages and navigation.
 */
var gPage;

@IonicPage()
@Component({
  selector: 'page-order-input',
  templateUrl: 'order-input.html',
})
export class OrderInputPage { //order.ts와 동작이 동일해야만 한다.
  order;
  browserRef;
  done:boolean=false;
  redirectUrl="http://www.takit.biz";

  menus;
  categorySelected:number=-1;
  unit:string;
  amount:number;
  menuIndex:number=-1;

  priceString;
  deliveryFeeString;

  deliveryStartHour;
  deliveryStartMin;
  deliveryEndHour;
  deliveryEndMin;
  deliveryMethod;

  menusIn;

  @ViewChild('inputToFocusStartHour') inputToFocusStartHour;
  @ViewChild('inputToFocusStartMin') inputToFocusStartMin;
  @ViewChild('inputToFocusEndHour') inputToFocusEndHour;
  @ViewChild('inputToFocusEndMin') inputToFocusEndMin;

  deliveryTimeUpdate; // 수정일 경우 다른 날짜인지를 판별하기 위해 필요함.

 //////////////////////////////////////////
  // menu변경 코드 -begin
  choices=[];
  choiceOptions=[];
  choiceOption=[];
  etc:string; //기타 
  package:string;
  // menu변경 코드 -end
  ///////////////////////////////////////////
  constructor(public navCtrl: NavController, 
              public navParams: NavParams,
              public platform:Platform,    
              private iab: InAppBrowser, 
              private ngZone:NgZone,
              public alertCtrl:AlertController,
              public storageProvider:StorageProvider) {
        gPage=this;        
        this.order=navParams.get('order');
        this.menusIn=navParams.get('menu');
        
        //this.order={"receiverSame":false,"recipientAddress":"주소 선택","addressInputType":"unknown","paymentOption":"undefined-undefined","menuList":[]}
        //this.menusIn=this.storageProvider.menus;

        console.log("order:"+JSON.stringify(this.order));

    this.menus=[];
    this.menusIn.forEach(menu=>{
        if(!menu.deactive){
          this.menus.push(menu);
        }
    });

    this.deliveryTimeUpdate=this.order.deliveryTime;
    if(this.order.price)
        this.priceString=this.order.price.toLocaleString();
    if(this.order.deliveryFee)   
        this.deliveryFeeString=this.order.deliveryFee.toLocaleString();

        if(this.order.deliveryTime){
          this.deliveryStartHour=this.order.deliveryTime.substr(11,2);
          this.deliveryStartMin=this.order.deliveryTime.substr(14,2);
        }
        if(this.order.deliveryTimeEnd){
          this.deliveryEndHour=this.order.deliveryTimeEnd.substr(11,2);
          this.deliveryEndMin=this.order.deliveryTimeEnd.substr(14,2);
        }
    this.deliveryMethod=this.order.deliveryMethod;
  }

  ionViewDidLoad() {
    console.log('ionViewDidLoad OrderInputPage');
  }

  inputBuyerPhoneNumber(){
        let buyerPhoneNumber=this.order.buyerPhoneNumber.trim();
        this.order.buyerPhoneNumber=this.storageProvider.autoHypenPhone(buyerPhoneNumber); // look for phone number
  }

 getJusoAuto(){
    this.order.addressInputType="auto";
    this.order.recipientAddress="주소 선택";
    this.getJusoDaum();
  }

  manualInput(){
    this.order.addressInputType="manual";
    this.order.recipientAddressDetail="";
    this.order.recipientAddress=""
  }

  getJusoDaum(){
    console.log("call daum API");
    let localfile;
    this.done=false;

    if(this.platform.is('android')){
        console.log("android");
        localfile='file:///android_asset/www/assets/address.html';
    }else if(this.platform.is('ios')){
        console.log("ios");
        localfile='assets/address.html';
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
            gPage.done=true;            
            gPage.browserRef.close();
        }
        });

        this.browserRef.on("exit").subscribe( (e) => {
        });
}

  deliveryMethodChange(){
    if(this.order.deliveryMethod=='픽업'){
        this.order.addressInputType="manual";
        this.order.recipientAddress="경기떡집";
    }else{
      if(this.deliveryMethod && this.deliveryMethod=='픽업' && this.order.deliveryMethod!="픽업"){
        this.order.addressInputType="unknown";
        this.order.recipientAddress="주소선택";
        this.order.recipientAddressDetail="";
      }
    }
    //change from 픽업-> other?
    this.deliveryMethod=this.order.deliveryMethod;
  }

  inputStartHour(){
     if(this.deliveryStartHour && this.deliveryStartHour.length==2){
          this.inputToFocusStartMin.setFocus();
     }
  }

  inputStartMin(){
     if(this.deliveryStartMin && this.deliveryStartMin.length==2){
          this.inputToFocusEndHour.setFocus();
     }
  }

  inputEndHour(){
     if(this.deliveryEndHour && this.deliveryEndHour.length==2){
          this.inputToFocusEndMin.setFocus();
     }
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

  inputRecipientPhoneNumber(){
        let recipientPhoneNumber=this.order.recipientPhoneNumber.trim();
        this.order.recipientPhoneNumber=this.storageProvider.autoHypenPhone(recipientPhoneNumber); // look for phone number
  }

  selectPayment(){
      if(this.order.paymentOption=="cash-unknown" || this.order.paymentOption=="cash-month"){
          this.order.price=0;
      }
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

  addMenu(){
    if(this.categorySelected==-1 ){
            let alert = this.alertCtrl.create({
              title: '종류를 선택해 주시기 바랍니다.',
              buttons: ['확인']
            });
            alert.present();
        return false;
    }   
 
    if(this.categorySelected==-2){
      if(!this.etc ||this.etc.trim().length==0){
            let alert = this.alertCtrl.create({
              title: '메뉴를 입력해 주시기 바랍니다.',
              buttons: ['확인']
            });
            alert.present();
            return false;
      }
      let menu={category:"직접입력",type:"general", menuString:this.etc, menu:this.etc};

      this.order.menuList.push(menu);              
      console.log("addMenu-직접입력-menu:"+JSON.stringify(menu));          
      this.categorySelected=-1;
      this.etc="";
      return true;
    }

   if(this.menus[this.categorySelected].type!="complex-choice" ){
        if(this.menuIndex==-1 ){
                let alert = this.alertCtrl.create({
                  title: '메뉴를 선택해 주시기 바랍니다.',
                  buttons: ['확인']
                });
                alert.present();
            return false;
        }    
        if(this.menus[this.categorySelected].type=="general" &&(!this.package || this.package.length ==0)){
                let alert = this.alertCtrl.create({
                  title: '포장을 선택해 주시기 바랍니다.',
                  buttons: ['확인']
                });
                alert.present();
                return false;
        }
   }

    if(!this.amount || this.amount==0){
            let alert = this.alertCtrl.create({
              title: '수량을 선택해 주시기 바랍니다.',
              buttons: ['확인']
            });
            alert.present();
        return false;
    }
    if(this.unit==undefined || this.unit.length==0){
            let alert = this.alertCtrl.create({
              title: '단위를 선택해 주시기 바랍니다.',
              buttons: ['확인']
            });
            alert.present();
        return false;
    }
    if(this.menus[this.categorySelected].type.startsWith("complex")){
          if(this.unit!="개"){
              let alert = this.alertCtrl.create({
                title: '복합 메뉴의 단위는 개만 선택가능합니다.',
                buttons: ['확인']
              });
              alert.present();
              return false;      
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
                return false;      
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
              return false;      
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
                   menuStringWithPackage+=key+menuObj[key]+" ";
                   let keyName:string=key;
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
              type:this.menus[this.categorySelected].type,
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
    return true;
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

  cancel(){
    this.navCtrl.pop();
  }

  save(){
    if(this.checkSave()){
    //주문을 저장하고 pop을 수행함
        console.log("saveOrder-output:" + JSON.stringify(this.order));
        if (this.order.id == undefined) {
            console.log("order creation " + JSON.stringify(this.order));
            //save order in DB by calling server API. 
            this.storageProvider.saveOrder(this.order).then(()=>{///
                  this.navCtrl.pop();
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
        }else {
            // please update DB here
            console.log("order modification");
            //update order List in DB by calling server API.
            let alert = this.alertCtrl.create({
                title:  "문자를 재발송하시겠습니까?",
                buttons: [
                        {
                        text: '아니오',
                        handler: () => {
                            this.order.sms=false;
                            this.updateOrdrFunc();
                            return;
                        }
                        },
                        {
                        text: '네',
                        handler: () => {
                            console.log('agree clicked');
                            this.order.sms=true;
                            this.updateOrdrFunc();
                        }
                        }]
            });
            alert.present();       
        }
    }
  }
/////////////////////////////////////////////////
 checkDeliveryTime(){
      return new Promise((resolve,reject)=>{   
        if(!this.deliveryEndHour || !this.deliveryEndMin){
            let alert = this.alertCtrl.create({
              title: '배송요청 종료시간을 배송요청 시작시간과 동일하게 입력합니다.',
              subTitle:' 아닐경우 아니오 선택후 시간과 분을 모두 입력해주세요',
              buttons: [
              {
                text: '아니오',
                handler: () => {
                  reject();
                }
              },
              {
                text: '네',
                handler: () => {
                  this.deliveryEndHour=this.deliveryStartHour;
                  this.deliveryEndMin=this.deliveryStartMin;
                  console.log('agree clicked');
                  resolve();
                }
              }]
            });
            alert.present();
        }else{
          resolve();
        }
      }); 
  }

  checkSave(){
    console.log("checkSave comes");
    if(!this.deliveryStartHour){
          let alert = this.alertCtrl.create({
            title: '배송요청 시작 시를 입력해 주시기 바랍니다.',
            buttons: ['확인']
          });
          alert.present();
          return ;          
    }

    if(!this.deliveryStartMin){
          let alert = this.alertCtrl.create({
            title: '배송요청 시작 분을 입력해 주시기 바랍니다.',
            buttons: ['확인']
          });
          alert.present();
          return ;          
    }

   if(parseInt(this.deliveryStartHour)>=24){
          let alert = this.alertCtrl.create({
            title: '배송요청 시작 시간을 정상적으로 입력해 주시기 바랍니다.',
            buttons: ['확인']
          });
          alert.present();
          return ;          

   }
   if(parseInt(this.deliveryStartMin)>=60){
          let alert = this.alertCtrl.create({
            title: '배송요청 시작 분을 정상적으로 입력해 주시기 바랍니다.',
            buttons: ['확인']
          });
          alert.present();
          return ;          
   }

   if(parseInt(this.deliveryEndHour)>=24){
          let alert = this.alertCtrl.create({
            title: '배송요청 종료 시간을 정상적으로 입력해 주시기 바랍니다.',
            buttons: ['확인']
          });
          alert.present();
          return ;          

   }
   if(parseInt(this.deliveryEndMin)>=60){
          let alert = this.alertCtrl.create({
            title: '배송요청 종료 분을 정상적으로 입력해 주시기 바랍니다.',
            buttons: ['확인']
          });
          alert.present();
          return ;          
   }
   //console.log("checkDeliveryTime call" );
     this.checkDeliveryTime().then(()=>{
          console.log("endHour:"+this.deliveryEndHour);
          console.log("endMin:"+this.deliveryEndMin);
          
          //let deliveryStartMin,deliveryEndHour,deliveryEndMin:string;
          let intNum:number;
          intNum=parseInt(this.deliveryStartHour);
          let deliveryStartHour:string=(intNum>9)?intNum.toString():'0'+intNum;
          intNum=parseInt(this.deliveryStartMin);
          let deliveryStartMin:string=(intNum>9)?intNum.toString():'0'+intNum;
          intNum=parseInt(this.deliveryEndHour);
          let deliveryEndHour:string=(intNum>9)?intNum.toString():'0'+intNum;
          intNum=parseInt(this.deliveryEndMin);
          let deliveryEndMin:string=(intNum>9)?intNum.toString():'0'+intNum;
        
        // 2018-04-20T08:30:00.000Z
          this.order.deliveryTime=this.storageProvider.deliveryDate.substring(0,11)+deliveryStartHour+":"+deliveryStartMin+":00.000Z";
          this.order.deliveryTimeEnd=this.storageProvider.deliveryDate.substring(0,11)+deliveryEndHour+":"+deliveryEndMin+":00.000Z";
        ////////////////////////////////////////////////////
          console.log("deliveryTime:"+this.order.deliveryTime);
          console.log("deliveryTimeEnd:"+this.order.deliveryTimeEnd);
          let start=new Date(this.order.deliveryTime);
          let end=new Date(this.order.deliveryTimeEnd);
          if(start.getTime()>end.getTime()){
            let alert = this.alertCtrl.create({
              title: '배송요청 시작시간이 배송요청 종료시간보다 늦을 수 없습니다.',
              buttons: ['확인']
            });
            alert.present();
            return ;      
          }

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

          if(this.categorySelected!=-1 || this.order.menuList==undefined || this.order.menuList.length==0){
              if(!this.addMenu())
                  return;        
          }

          console.log("this.order.paymentOption:"+this.order.paymentOption);
          if(this.order.paymentOption=="undefined-undefined"){
            let alert = this.alertCtrl.create({
              title: '결제 수단/방법을 선택하세요.',
              buttons: ['확인']
            });
            alert.present();
            return ;
          }

          if(this.order.price == undefined && !((this.order.paymentOption=="cash-unknown" || this.order.paymentOption=="cash-month")&&this.order.price==0)){
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

          //this.order.paymentOption=this.paymentOption;//workaround solution
          //this.order.deliveryMethod=this.deliveryMethod;//workaround solution

          switch(this.order.paymentOption){
            case "cash-paid-pre":   this.order.paymentMethod="cash"; this.order.payment="paid-pre"; this.order.paymentString="현금선불-완납"; break;
            case "cash-unpaid-after": this.order.paymentMethod="cash"; this.order.payment="unpaid-after";this.order.paymentString="현금후불";break;
            case "cash-unpaid-transaction": this.order.paymentMethod="cash"; this.order.payment="unpaid-transaction";this.order.paymentString="현금이체";break;      
            case "cash-unknown":  this.order.paymentMethod="cash"; this.order.payment="unknown";this.order.paymentString="현금보류";break;
            case "cash-month":  this.order.paymentMethod="cash"; this.order.payment="month";this.order.paymentString="월말정산";break;
            case "card-paid-pre":   this.order.paymentMethod="card"; this.order.payment="paid-pre";this.order.paymentString="카드선불-완납";break;
            case "card-unpaid":  this.order.paymentMethod="card"; this.order.payment="unpaid";this.order.paymentString="카드기";break;
            case "cash-paid":this.order.paymentMethod="cash";  this.order.payment="paid";this.order.paymentString="현금이체-완납";
            //case "card-paid":this.order.paymentMethod="card";this.order.payment="paid";this.order.paymentString="카드기-완납"; break;
            //case "cash-paid-after":this.order.paymentMethod="cash"; this.order.payment="paid-after";this.order.paymentString="현금후불-완납";break; 
          }
          if(this.order.id){
              if(this.deliveryTimeUpdate.substr(0,10)!=this.order.deliveryTime.substr(0,10)){
                  this.order.diffDate=true;          
                  this.order.deliveryTime=this.deliveryTimeUpdate.substr(0,10)+this.order.deliveryTime.substr(10); 
                  this.order.deliveryTimeEnd= this.deliveryTimeUpdate.substr(0,10)+this.order.deliveryTimeEnd.substr(10);
                  console.log("please check deliveryDate change..."+this.order.deliveryTime+" "+this.order.deliveryTimeEnd);
              }else
                  this.order.diffDate=false;
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
          return true;
     },err=>{
          return;
     });
  }

   updateOrdrFunc(){
        this.storageProvider.updateOrder(this.order).then(()=>{///
                    if(this.order.diffDate){
                            let alert = this.alertCtrl.create({
                                title:  this.order.deliveryTime.substr(0,10)+'일 화면을 확인하시겠습니까?',
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
                                            this.storageProvider.setDeliveryDate(this.order.deliveryTime);
                                            this.storageProvider.refresh("order");
                                            return;
                                        }
                                        }]
                            });
                            alert.present();                                    
                    }   
            },err=>{
                if(typeof err==="string" && err.indexOf("SMS-")>=0){
                    if(this.order.diffDate){
                            let alert = this.alertCtrl.create({
                                title:  this.order.deliveryTime.substr(0,10)+'으로 화면의 배달일을 이동하시겠습니까?',
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
                                            this.storageProvider.setDeliveryDate(this.order.deliveryTime);
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
}
