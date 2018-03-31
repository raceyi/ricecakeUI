import { Component } from '@angular/core';
import { IonicPage, NavController, NavParams ,AlertController} from 'ionic-angular';
import {StorageProvider} from "../../providers/storage/storage";

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

 removeCategory(category,i){

 } 

 addCategory(){
  if(!this.newCategory || this.newCategory.trim().length==0){
            let alert = this.alertCtrl.create({
              title: '종류를 입력해주시기 바랍니다.',
              buttons: ['확인']
            });
            alert.present();
  }
  this.storageProvider.menus.push({category:this.newCategory.trim(),menus:[],type:this.newCategoryType});
            let alert = this.alertCtrl.create({
              title: '종류에 이름을 추가하셔야 종류가 최종 저장됩니다.',
              buttons: ['확인']
            });
            alert.present();
   this.categorySelected=this.storageProvider.menus.length-1;          
 }

 removeMenu(menu,i){

 }

 addMenu(){

 }

 selectCategory(i){
   this.categorySelected=i;
 }

 categoyTypeSelect(type){
   this.newCategoryType=type;
   console.log("categoyTypeSelect "+this.newCategoryType);
 }
}
