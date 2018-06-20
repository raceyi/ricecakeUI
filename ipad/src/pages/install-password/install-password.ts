import { Component } from '@angular/core';
import { IonicPage, NavController, App,NavParams,AlertController } from 'ionic-angular';
import {ServerProvider} from "../../providers/server/server";
import { NativeStorage } from '@ionic-native/native-storage';
import { TabsPage } from '../tabs/tabs';

/**
 * Generated class for the InstallPasswordPage page.
 *
 * See https://ionicframework.com/docs/components/#navigation for more info on
 * Ionic pages and navigation.
 */

@IonicPage()
@Component({
  selector: 'page-install-password',
  templateUrl: 'install-password.html',
})
export class InstallPasswordPage {

   passwordLength:number=4;
  passwordInput=['',' ',' ',' '];
  password=[' ',' ',' ',' '];
  cursor:number=0;

  constructor(public navCtrl: NavController, 
              public alertCtrl:AlertController,
              public serverProvider:ServerProvider,
              public nativeStorage:NativeStorage,
              public app:App,
              public navParams: NavParams) {
  }

  ionViewDidLoad() {
    console.log('ionViewDidLoad InstallPasswordPage');
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
            console.log("this.password:"+this.passwordInput);
        }
        if(this.cursor==this.passwordLength){
              console.log("this.password:"+this.passwordInput);
              let pin="";
              pin=pin.concat(this.passwordInput[0],this.passwordInput[1],this.passwordInput[2],
                    this.passwordInput[3]);
              console.log("pin:"+pin);
              //Please check if password is correct or not by calling server API
              this.serverProvider.checkInstallPIN(pin).then(()=>{
                        this.nativeStorage.setItem("install","true").then(()=>{

                        },err=>{
                          let alert = this.alertCtrl.create({
                              title: '설정에 실패했습니다.',
                              buttons: ['확인']
                          });
                          alert.present();
                        });
                        //this.navCtrl.pop();
                        this.app.getRootNavs()[0].setRoot(TabsPage);
              },err=>{
                    if(typeof err==="string" && err.indexOf("invalidPIN")>=0){
                        let alert = this.alertCtrl.create({
                            title: '설치 비밀번호가 일치하지 않습니다.',
                            buttons: ['확인']
                        });
                        alert.present();
                    }else if(typeof err==="string" ){
                    let alert = this.alertCtrl.create({
                        title: '설치 비번 확인에 실패했습니다.',
                        subTitle:err,
                        buttons: ['확인']
                    });
                    alert.present();
                    }
              });
        }
  }

/*
  close(){
      this.navCtrl.pop();
  }
*/
}
