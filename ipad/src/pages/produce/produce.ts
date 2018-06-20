import { Component } from '@angular/core';
import { IonicPage, NavController, NavParams ,App,AlertController} from 'ionic-angular';
import {ManagerEntrancePage} from '../manager-entrance/manager-entrance';
import {TrashPage} from '../trash/trash';
import { StorageProvider } from '../../providers/storage/storage';
import {ServerProvider} from "../../providers/server/server";

/**
 * Generated class for the ProducePage page.
 *
 * See https://ionicframework.com/docs/components/#navigation for more info on
 * Ionic pages and navigation.
 */

@IonicPage()
@Component({
  selector: 'page-produce',
  templateUrl: 'produce.html',
})
export class ProducePage {

  constructor(public navCtrl: NavController, public navParams: NavParams,public app:App,
              private alertCtrl:AlertController,
              public storageProvider:StorageProvider,private serverProvider:ServerProvider) {
  }

  ionViewDidLoad() {
    console.log('ionViewDidLoad ProducePage');
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

  goManager(){
      this.app.getRootNavs()[0].push(ManagerEntrancePage);
  }

  goTrash(){
      this.app.getRootNavs()[0].push(TrashPage);
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
