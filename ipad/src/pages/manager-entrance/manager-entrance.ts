import { Component } from '@angular/core';
import { IonicPage, NavController, NavParams,AlertController } from 'ionic-angular';
import {ManagerPage} from '../manager/manager';
/**
 * Generated class for the ManagerEntrancePage page.
 *
 * See https://ionicframework.com/docs/components/#navigation for more info on
 * Ionic pages and navigation.
 */

@IonicPage()
@Component({
  selector: 'page-manager-entrance',
  templateUrl: 'manager-entrance.html',
})
export class ManagerEntrancePage {

  passwordLength:number=4;
  passwordInput=['',' ',' ',' '];
  password=[' ',' ',' ',' '];
  cursor:number=0;

  constructor(public navCtrl: NavController, 
              public alertCtrl:AlertController,
              public navParams: NavParams) {
  }

  ionViewDidLoad() {
    console.log('ionViewDidLoad ManagerEntrancePage');
  }

 buttonPressed(val:number){
        console.log("cursor:"+this.cursor+" val:"+val);
        if(val==-1 ){
            console.log("val is -1");
            this.cursor = (this.cursor>=1) ? (this.cursor-1 ): this.cursor;
            this.password[this.cursor]=' ';
            this.passwordInput[this.cursor]=' ';
        }else if(val==-10){
            console.log("val is -10");
            for(var i=0;i<this.passwordLength;i++){
                this.password[i]=' ';
                this.passwordInput[i]=' ';
            }
            this.cursor = 0;
        }else if(this.cursor<this.passwordLength){
            if(this.cursor!=0){
              this.password[this.cursor-1]='*';
            }
            if(this.cursor==5){
                this.passwordInput[this.cursor]=val.toString();  
                this.password[this.cursor++]='*';
            }else{
                this.passwordInput[this.cursor]=val.toString();  
                this.password[this.cursor++]=val.toString();
            }
            console.log("this.password:"+this.password);
        }
        if(this.cursor==this.passwordLength){
              //Please check if password is correct or not by calling server API
              this.navCtrl.push(ManagerPage);
              /*
              let alert = this.alertCtrl.create({
                  title: '비밀번호가 일치하지 않습니다.',
                  buttons: ['확인']
                });
                alert.present();
                */
        }
  }

  close(){
      this.navCtrl.pop();
  }

}
