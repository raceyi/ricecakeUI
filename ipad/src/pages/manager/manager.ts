import { Component } from '@angular/core';
import { IonicPage, NavController, NavParams ,AlertController,Platform} from 'ionic-angular';
import {StorageProvider} from "../../providers/storage/storage";
import {ServerProvider} from "../../providers/server/server";

/**
 * Generated class for the ManagerPage page.
 *
 * See https://ionicframework.com/docs/components/#navigation for more info on
 * Ionic pages and navigation.
 */

@IonicPage()
@Component({
  selector: 'page-manager',
  templateUrl: 'manager.html',
})
export class ManagerPage {
  section="sales";
  categorySelected:number=0;
  newCategoryType="general";
  newCategory;
  newName;
  newAmount;
  newComplexMenuItems=[];
  searchKeyWord;

  startDateIn;  //input format
  endDateIn;    // input format

  cashPaid:number=0;
  cashUnpaid:number=0;
  cardPaid:number=0;
  cardUnpaid:number=0;

  totalSales:number=0;

  constructor(public navCtrl: NavController, 
              public navParams: NavParams,
              public alertCtrl:AlertController,
              private platform: Platform,
              public serverProvider:ServerProvider,
              public storageProvider:StorageProvider) {
                // today
                let today=new Date();
                this.startDateIn={year:today.getFullYear(),month:today.getMonth(),date:today.getDate()};
                this.endDateIn={year:today.getFullYear(),month:today.getMonth(),date:today.getDate()};

  }

  ionViewDidLoad() {
    console.log('ionViewDidLoad ManagerPage');
    this.platform.ready().then(() => {
           
    });
  }

  close(){
      this.navCtrl.pop();
  }

  salesSection(){
    this.section="sales";
  }

  menuSection(){
    this.section="menu";
  }

  onStartDaySelect(day){
    console.log("day:"+JSON.stringify(day));
    this.startDateIn=day;
    console.log("start-day:"+JSON.stringify(day));
    this.updateSales();
  }
  
  peridoCheck(){
    console.log("startDateIn "+JSON.stringify(this.startDateIn));

//{"year":2018,"month":3,"date":1,"isThisMonth":true,"isToday":false,"isSelect":true,"hasEvent":false}

    var start = new Date(this.startDateIn.year, this.startDateIn.month, this.startDateIn.date, 0, 0, 0, 0);
    var end = new Date(this.endDateIn.year, this.endDateIn.month, this.endDateIn.date, 0, 0, 0, 0);
    
    console.log("start:"+start.getTime()+" end:"+end.getTime());

    if(start.getTime()<=end.getTime())
        return true;
     return false;   
  }
  
  formatDate(day){
    let month=(day.month+1)<=9?"0"+(day.month+1):(day.month+1);
    let date=(day.date)<=9?"0"+(day.date):day.date;
    return day.year+"-"+month+"-"+date;
  }

  updateSales(){
    if(!this.peridoCheck()){
            let alert = this.alertCtrl.create({
              title: '시작일은 종료일보다 빨라야만 합니다.',
              buttons: ['확인']
            });
            alert.present();
            return;      
    }
    let startDate=this.formatDate(this.startDateIn);
    let endDate=this.formatDate(this.endDateIn);
    this.serverProvider.getSales(startDate,endDate).then((value:any)=>{
        console.log("sales:"+JSON.stringify(value));
        this.cashPaid=value.cashPaid;
        this.cashUnpaid=value.cashUnpaid;
        this.cardPaid=value.cardPaid;
        this.cardUnpaid=value.cardUnpaid;
        this.totalSales=this.cashPaid+this.cardPaid+this.cashUnpaid+this.cardUnpaid;
        console.log("totalSales:"+this.totalSales);
        this.searchKeyWord="";
    },(err)=>{
            let alert = this.alertCtrl.create({
              title: '네트웍 상태를 확인해주시기 바랍니다.',
              buttons: ['확인']
            });
            alert.present();
            return;

    })
  }

  onEndDaySelect(day){
    this.endDateIn=day;    
    console.log("end-day:"+JSON.stringify(day));
    this.updateSales();    
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

 addCategory(){
  if(!this.newCategory || this.newCategory.trim().length==0){
            let alert = this.alertCtrl.create({
              title: '종류를 입력해주시기 바랍니다.',
              buttons: ['확인']
            });
            alert.present();
            return;
  }
  this.storageProvider.menus.push({category:this.newCategory.trim(),menus:[],menuStrings:[],type:this.newCategoryType});
  if(this.newCategoryType=="general"){
                let alert = this.alertCtrl.create({
                  title: '종류에 이름을 추가하셔야 종류가 최종 저장됩니다.',
                  buttons: ['확인']
                });
                alert.present();
  }else{
            let alert = this.alertCtrl.create({
              title:" 이름 영역의 저장 버튼을 클릭하셔야 종류가 최종 저장됩니다.",
              buttons: ['확인']
            });
            alert.present();
  }
   this.newCategory="";         
   this.categorySelected=this.storageProvider.menus.length-1;          
   //initialize new names
    this.newName="";
    this.newAmount="";
    this.newComplexMenuItems=[];   
 }

 addMenu(){
  if(!this.newName || this.newName.trim().length==0){
            let alert = this.alertCtrl.create({
              title: '이름을 입력해주시기 바랍니다.',
              buttons: ['확인']
            });
            alert.present();
            return;
  }
  this.storageProvider.addMenu(this.storageProvider.menus[this.categorySelected].category, this.newName.trim()).then(()=>{
      this.newName="";
  },err=>{
     if(typeof err==="string" && err.indexOf("AlreadyExist")>=0){
                    let alert = this.alertCtrl.create({
                        title: '이미 존재하는 메뉴입니다.',
                        buttons: ['확인']
                    });
                    alert.present();
            }
  })
 }

  addComplexMenuItem(){
      if(!this.newName || this.newName.trim().length==0){
                let alert = this.alertCtrl.create({
                  title: '이름을 입력해주시기 바랍니다.',
                  buttons: ['확인']
                });
                alert.present();
                return;
      }
      if(this.newCategoryType=="complex"  &&( !this.newAmount|| this.newAmount.trim().length==0)){
                let alert = this.alertCtrl.create({
                  title: '수량을 입력해 주시기 바랍니다.',
                  buttons: ['확인']
                });
                alert.present();        
                return;
      }
      let object={};
      object[this.newName.trim()]=parseInt(this.newAmount);
      object["string"]=this.newName.trim()+" "+this.newAmount;
      this.newComplexMenuItems.push(object);
      console.log("newComplexMenuItems:"+JSON.stringify(this.newComplexMenuItems));
      this.newName="";
      this.newAmount="";
  }

  saveComplexMenu(){
    if(this.newComplexMenuItems.length==0){
                let alert = this.alertCtrl.create({
                  title: '추가할 이름을 입력해주시기 바랍니다.',
                  buttons: ['확인']
                });
                alert.present();
                return;
    }

    // "menu": "[{\"모듬찰떡\":1},{\"단호박소담\":1},{\"완두시루떡\":1}]"
    let menu=[];
    let menuString="";
    this.newComplexMenuItems.forEach(item=>{
        console.log("item:"+JSON.stringify(item));
        menuString+=" "+item.string;      
        let obj=item;
        delete obj.string;
        console.log("obj:"+JSON.stringify(obj));
        menu.push(obj);
    })
    console.log("menus:"+JSON.stringify(this.storageProvider.menus));

    this.storageProvider.addMenu(this.storageProvider.menus[this.categorySelected].category, JSON.stringify(menu)).then(()=>{
      this.newName="";    
      this.newAmount="";
      this.newComplexMenuItems=[];
    },err=>{
                let alert = this.alertCtrl.create({
                    title: '메뉴 추가에 실패했습니다.',
                    buttons: ['확인']
                });
                alert.present();                
              
    })
  }

  removeComplexMenuItems(i){
    this.newComplexMenuItems.splice(i,1);    
  }

removeMenuFunc(category,name){
  this.storageProvider.deleteMenu(category,name).then(()=>{

  },err=>{
        console.log("deleteMenu err:"+JSON.stringify(err));
                  let alert = this.alertCtrl.create({
                      title: '메뉴 삭제에 실패했습니다.',
                      buttons: ['확인']
                  });
                  alert.present();              
  })  
}


 removeMenu(menu,i){
    let alert = this.alertCtrl.create({
                          title: menu+"를 삭제합니다",
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
                                  if(this.storageProvider.menus[this.categorySelected].type =="complex" ||
                                    this.storageProvider.menus[this.categorySelected].menus.length==1){
                                              let alert = this.alertCtrl.create({
                                                title: '이름과 함께 종류가 삭제됩니다.',
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
                                                    //this.removeMenuFunc(menu,i);
                                                    if(this.storageProvider.menus[this.categorySelected].type =="complex"){
                                                        this.removeMenuFunc(this.storageProvider.menus[this.categorySelected].category,
                                                                              this.storageProvider.menus[this.categorySelected].menus[0]);
                                                    }else
                                                        this.removeMenuFunc(this.storageProvider.menus[this.categorySelected].category,menu);
                                                    return;
                                                  }
                                                }]
                                              });
                                              alert.present();
                                              return;
                                  }
                                  console.log("this.storageProvider.menus[this.categorySelected].length: "+this.storageProvider.menus[this.categorySelected].menus.length);
                                  this.removeMenuFunc(this.storageProvider.menus[this.categorySelected].category,menu);
                                  return;
                            }
                          }]});
      alert.present();                       
 }

 removeCategory(category,i){
    if( this.storageProvider.menus[this.categorySelected].menus.length>0){
        let alert = this.alertCtrl.create({
          title: this.storageProvider.menus[this.categorySelected].category+' 종류를 삭제 하시겠습니까?',
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
                      if(this.storageProvider.menus[this.categorySelected].type=="general"){
                          let index;
                          let menus=this.storageProvider.menus[this.categorySelected].menus;
                          let category=this.storageProvider.menus[this.categorySelected].category;
                          for(index=0;index<menus.length;index++){
                              this.removeMenuFunc(category,menus[index]);
                          }
                      }else{// complex
                          this.removeMenuFunc(this.storageProvider.menus[this.categorySelected].category,
                                                this.storageProvider.menus[this.categorySelected].menus[0]);                        
                      }
                      this.categorySelected=((this.categorySelected-1)>=0)?(this.categorySelected-1):0;
                      console.log('agree clicked');
                    }
                  }]
        });
        alert.present();
    }else{
      //just delete recently added category. just UI display
      
    }    
 } 


 selectCategory(i){
   this.categorySelected=i;
 }

 categoyTypeSelect(type){
   this.newCategoryType=type;
   console.log("categoyTypeSelect "+this.newCategoryType);
 }

 searchSales(){
   if(!this.searchKeyWord || this.searchKeyWord.trim().length==0){
            let alert = this.alertCtrl.create({
              title: '주문자를 입력해 주시기 바랍니다.',
              buttons: ['확인']
            });
            alert.present();
            return;      
   }
    if(!this.peridoCheck()){
            let alert = this.alertCtrl.create({
              title: '시작일은 종료일보다 빨라야만 합니다.',
              buttons: ['확인']
            });
            alert.present();
            return;      
    }
    let startDate=this.formatDate(this.startDateIn);
    let endDate=this.formatDate(this.endDateIn);
    this.serverProvider.getSalesWithBuyer(startDate,endDate,this.searchKeyWord.trim()).then((value:any)=>{
        console.log("sales:"+JSON.stringify(value));
        this.cashPaid=value.cashPaid;
        this.cashUnpaid=value.cashUnpaid;
        this.cardPaid=value.cardPaid;
        this.cardUnpaid=value.cardUnpaid;
        this.totalSales=this.cashPaid+this.cardPaid+this.cashUnpaid+this.cardUnpaid;
    },(err)=>{
            let alert = this.alertCtrl.create({
              title: '네트웍 상태를 확인해주시기 바랍니다.',
              buttons: ['확인']
            });
            alert.present();
            return;

    })
 }
 
}
