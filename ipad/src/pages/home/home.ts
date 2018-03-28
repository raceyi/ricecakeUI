import { Component } from '@angular/core';
import { NavController,AlertController } from 'ionic-angular';
import * as moment from 'moment';

@Component({
  selector: 'page-home',
  templateUrl: 'home.html'
})
export class HomePage {
  section="order";
  searchKeyWord:string;
  
  deliveryDate; //배달일을 지정함 
  deliveyDay;   //배달일의 요일을 지정함. 월요일,화요일,...일요일

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
            "menu": "단호박 소담"
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



  //새주문 입력 패라미터
  newDeliveryTime; //새주문 입력시 배달시간
  newRecipientAddress: string="도로명 주소 선택";
  newAddressInputType:string="unknown"; // unknown, manual,auto: 주소 입력 모드 
  newRecipientAddressDetail:string;
  newReceiverSame:boolean=false;
  newBuyerName:string;
  newBuyerPhoneNumber:string;
  newRecipientPhoneNumber:string;
  newRecipientName:string;
  newDeliveryFee:number;
  newPrice:number;
  newDeliveryMethod:string;
  newPayment:string;
  newCarrier:string;
  categorySelected:number=-1;
  unit:string;
  amount:number;
  menuIndex:number;
  menuList=[];
  //기존 주문 수정 패라미터
  orderList=[];

  newOrderInputShown:boolean=false;
  constructor(public navCtrl: NavController,    
              public alertCtrl:AlertController) {
      let now=new Date().getTime();
      this.setDeliveryDate(now);
      console.log("deliveryDate:"+this.deliveryDate);
      this.convertMenuInfo(this.menus);
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

  getDayInKorean(day){
    switch(day){
      case 0:return "일요일";
      case 1:return "월요일";
      case 2:return "화요일";
      case 3:return "수요일";
      case 4:return "목요일";
      case 5:return "금요일";
      case 6:return "토요일";
    }
  }

  getISO8601Format(milliseconds){
    let d=new Date(milliseconds);
    var mm = d.getMonth() < 9 ? "0" + (d.getMonth() + 1) : (d.getMonth() + 1); // getMonth() is zero-based
    var dd  = d.getDate() < 10 ? "0" + d.getDate() : d.getDate();
    var hh = d.getHours() <10? "0"+d.getHours(): d.getHours();
    var min = d.getMinutes()<10? "0"+d.getMinutes():d.getMinutes(); 
    return d.getFullYear()+'-'+(mm)+'-'+dd+'T'+hh+":"+min+moment().format("Z");
  }
  
  setDeliveryDate(milliseconds){
    let d=new Date(milliseconds);
    var mm = d.getMonth() < 9 ? "0" + (d.getMonth() + 1) : (d.getMonth() + 1); // getMonth() is zero-based
    var dd  = d.getDate() < 10 ? "0" + d.getDate() : d.getDate();
    var hh = d.getHours() <10? "0"+d.getHours(): d.getHours();
    var min = d.getMinutes()<10? "0"+d.getMinutes():d.getMinutes(); 
    var dString=d.getFullYear()+'-'+(mm)+'-'+dd+'T'+hh+":"+min+moment().format("Z");
    this.deliveryDate=dString;
    this.deliveyDay= this.getDayInKorean(d.getDay());
  }

  orderSection(){
    this.section='order';
  }

  deliverySection(){
    this.section='delivery';
  }

  produceSection(){
    this.section='produce';
  }

  searchOrderItems(){
    let searchKeyword=this.searchKeyWord.trim();
    if('0'<=searchKeyword[0] && searchKeyword[0]<='9'){ //It is digit.
        this.searchKeyWord=this.autoHypenPhone(searchKeyword); // look for phone number
    }
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

  getISOtime(time){  // milliseconds
    let d=new Date(time);
    var sss = d.getMilliseconds();
    var ss = d.getSeconds() < 10? "0" + (d.getSeconds()) : (d.getSeconds());
    var mm = d.getMonth() < 9? "0" + (d.getMonth() + 1) : (d.getMonth() +1);
    var dd = d.getDate() <10? "0" + d.getDate() : d.getDate();
    var hh = d.getHours() <10? "0" + d.getHours() : d.getHours();
    var min = d.getMinutes() <10? "0"+d.getMinutes() : d.getMinutes();
    var dString = d.getFullYear()+ '-' + (mm) + '-' + (dd) + 'T' + hh + ":" + min + ":" + ss + "." + sss;
    return dString;
  }

  orderGoYesterday(){
    let yesterday=new Date(this.deliveryDate).getTime()-24*60*60*1000;
    console.log("order move yesterday:"+this.getISOtime(yesterday));

    this.setDeliveryDate(yesterday);


    let body ={deliveryDate: this.getISOtime(yesterday).substring(0,10)};
    console.log("body: "+JSON.stringify(body));
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
  }

  orderGoTomorrow(){
    let tomorrow=new Date(this.deliveryDate).getTime()+24*60*60*1000;
    console.log("order move tomorrow:"+this.getISOtime(tomorrow));

    this.setDeliveryDate(tomorrow);

    let body ={deliveryDate: this.getISOtime(tomorrow).substring(0,10)};
    console.log("body: "+JSON.stringify(body));

  }
/////////////////////////////////////////////////////////

resetNewOrder(){
    let deliveryDate=new Date(this.deliveryDate);
    deliveryDate.setHours(0);
    deliveryDate.setMinutes(0);
    deliveryDate.setSeconds(0);
    deliveryDate.setMilliseconds(0);
    this.newDeliveryTime=this.getISO8601Format(deliveryDate.getTime()); //새주문 입력시 배달시간
    this.newRecipientAddress="도로명 주소 선택";
    this.newAddressInputType="unknown"; // unknown, manual,auto: 주소 입력 모드 

    this.newRecipientAddressDetail="";
    this.newReceiverSame=false;
    this.newBuyerName="";
    this.newBuyerPhoneNumber="";
    this.newRecipientPhoneNumber="";
    this.newRecipientName="";
    this.newDeliveryFee=undefined;
    this.newPrice=undefined;
    this.newDeliveryMethod=undefined;
    this.newPayment=undefined;

    this.categorySelected=-1;
    this.unit=undefined;
    this.amount=undefined;
}

  newOrder(){
    //1.reset order info
    this.resetNewOrder();    
    //2. show order input area
    this.newOrderInputShown=true; 
  }

  newGetJuso(){
    this.newAddressInputType="auto";
  }

  newManualInput(){
    this.newAddressInputType="manual";
    this.newRecipientAddress=""
  }

  newOrderCancel(){ //initialize and hide orderArea
    this.newOrderInputShown=false; 
    this.resetNewOrder();
  }

  newReceiverSameChange(){
    console.log("newReceiverSameChange");
    if(this.newReceiverSame){
      this.newRecipientPhoneNumber=this.newBuyerPhoneNumber;
      this.newRecipientName=this.newBuyerName;
    }else{
      if(this.newRecipientPhoneNumber==this.newBuyerPhoneNumber
          && this.newRecipientName==this.newBuyerName){
            this.newRecipientName="";
            this.newRecipientPhoneNumber="";
          }
    }
  }

  inputNewBuyerPhoneNumber(){
        let newBuyerPhoneNumber=this.newBuyerPhoneNumber.trim();
        this.newBuyerPhoneNumber=this.autoHypenPhone(newBuyerPhoneNumber); // look for phone number
  }

  inputnewRecipientPhoneNumber(){
        let newRecipientPhoneNumber=this.newRecipientPhoneNumber.trim();
        this.newRecipientPhoneNumber=this.autoHypenPhone(newRecipientPhoneNumber); // look for phone number
  }

  inputNewBuyerName(){
    console.log("inputNewBuyerName");
    if(this.newReceiverSame){
        this.newRecipientName=this.newBuyerName;
    }
  }

 reflectNewBuyerPhoneNumber(){
   if(this.newReceiverSame){
        this.newRecipientPhoneNumber=this.newBuyerPhoneNumber;
    }
 }

  sum(a,b){
    if(!a){
      return parseInt(b);
    }
    if(!b){
      return parseInt(a);
    }
    return parseInt(a)+parseInt(b);
  }

  changeAddressInputType(type){
    this.newAddressInputType=type;
    this.newRecipientAddress="도로명 주소 선택";
  }


  selectCategory(){
    if(this.categorySelected==-1){
      console.log("categorySelected is -1. How can it happen?");
      return;
    }
    console.log("selectCategory:"+this.categorySelected);
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
    if(this.amount==undefined || this.amount==0){
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
    
    let menu={category:this.menus[this.categorySelected].category,
              menuString:this.menus[this.categorySelected].menuStrings[this.menuIndex],
              menu:this.menus[this.categorySelected].menus[this.menuIndex], 
              amount:this.amount, unit: this.unit}
    this.menuList.push(menu);              
    console.log("menu:"+JSON.stringify(menu));          
    this.categorySelected=-1;
    this.unit="";
    this.amount=0;
    this.menuIndex=-1;
  }

 removeMenu(i){
    this.menuList.splice(i,1);
 }

  save(){

  }
/////////////////////////////////////////////////////////
}
