import { Component } from '@angular/core';
import { IonicPage, NavController, NavParams ,AlertController} from 'ionic-angular';
import {StorageProvider} from "../../providers/storage/storage";
import {ManagerPasswordPage} from "../manager-password/manager-password";
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

  constructor(public navCtrl: NavController, 
              public navParams: NavParams,
              public alertCtrl:AlertController,
              public storageProvider:StorageProvider) {

          storageProvider.menus.forEach(category=>{
            console.log("..."+JSON.stringify(category));
          })
  }

  ionViewDidLoad() {
    console.log('ionViewDidLoad ManagerPage');
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
    console.log("start-day:"+JSON.stringify(day));
    //day.year
    //day.month+1
    //day.date
  }

  onEndDaySelect(day){
    console.log("end-day:"+JSON.stringify(day));
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
  this.storageProvider.menus[this.categorySelected].menus.push(this.newName);
  this.storageProvider.menus[this.categorySelected].menuStrings.push(this.newName);                   
  this.newName="";
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
      object[this.newName]=this.newAmount;
      object["string"]=this.newName+" "+this.newAmount;
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
    this.storageProvider.menus[this.categorySelected].menus.push(JSON.stringify(menu));
    this.storageProvider.menus[this.categorySelected].menuStrings.push( menuString);
    console.log("menus:"+JSON.stringify(this.storageProvider.menus));

    this.newName="";    
    this.newAmount="";
    this.newComplexMenuItems=[];
  }

  removeComplexMenuItems(i){
    this.newComplexMenuItems.splice(i,1);    
  }

 removeMenuFunc(menu,i){
    this.storageProvider.menus[this.categorySelected].menus.splice(i,1)
    this.storageProvider.menus[this.categorySelected].menuStrings.splice(i,1);
    if(this.storageProvider.menus[this.categorySelected].menus.length==0){
        this.storageProvider.menus.splice(this.categorySelected,1);
        this.categorySelected=0;
    }
 }

 removeMenu(menu,i){
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
                      this.removeMenuFunc(menu,i);
                      return;
                    }
                  }]
                });
                alert.present();
                return;
    }
    console.log("this.storageProvider.menus[this.categorySelected].length: "+this.storageProvider.menus[this.categorySelected].menus.length);
    this.removeMenuFunc(menu,i);
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
                      this.storageProvider.menus[this.categorySelected].splice(i,1);
                      console.log('agree clicked');
                      return;
                    }
                  }]
        });
        alert.present();
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

 }
 
 openConfig(){
   console.log("push ManagerPasswordPage");
   this.navCtrl.push(ManagerPasswordPage);
 }
}
