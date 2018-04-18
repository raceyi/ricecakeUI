import { Component } from '@angular/core';
import { IonicPage, NavController, NavParams,AlertController } from 'ionic-angular';
import {ServerProvider} from "../../providers/server/server";

/**
 * Generated class for the ManagerPasswordPage page.
 *
 * See https://ionicframework.com/docs/components/#navigation for more info on
 * Ionic pages and navigation.
 */

@IonicPage()
@Component({
  selector: 'page-manager-password',
  templateUrl: 'manager-password.html',
})
export class ManagerPasswordPage {
  passwordLength:number=4;
  passwordInput=['',' ',' ',' '];
  password=[' ',' ',' ',' '];
  cursor:number=0;


  existingPasswordInput=['',' ',' ',' '];
  existingPassword=[' ',' ',' ',' '];
  existingCursor:number=0;

  newPasswordInput=['',' ',' ',' '];
  newPassword=[' ',' ',' ',' '];
  newPasswordCursor:number=0;

  newPasswordConfirmInput=['',' ',' ',' '];
  newPasswordConfirm=[' ',' ',' ',' '];
  newPasswordConfirmCursor:number=0;

  existingPasswordPin;
  newPasswordPin;
  newPasswordConfirmPin;

  currentInput="existingPassword";

  constructor(public navCtrl: NavController,
              public alertCtrl:AlertController,
              public serverProvider:ServerProvider, 
              public navParams: NavParams) {
  }

  ionViewDidLoad() {
    console.log('ionViewDidLoad ManagerPasswordPage');
  }

  clickExistingPassword(){
     console.log("clickExistingPassword comes");      
     this.currentInput="existingPassword";
  }

 clickNewPasswordConfirm(){
     console.log("clickNewPasswordConfirm comes");
     this.currentInput="newPasswordConfirm";
 }

 clickNewPassword(){
     console.log("clickNewPassword comes");
     this.currentInput="newPassword";
 }

  modifyPassword(){
    console.log("modifyPassword "+this.existingPasswordPin+" "+this.newPasswordPin+" "+this.newPasswordConfirmPin);

    if(!this.existingPasswordPin || this.existingPasswordPin.length<4){
                let alert = this.alertCtrl.create({
                    title: '기존 비밀번호를 입력해 주시기 바랍니다.',
                    buttons: ['확인']
                  });
                  alert.present();
                  return;
    }

    if(!this.newPasswordPin || this.newPasswordPin.length<4){
                let alert = this.alertCtrl.create({
                    title: '새비밀번호를 입력해 주시기 바랍니다.',
                    buttons: ['확인']
                  });
                  alert.present();
                  return;
    }
    
    if(!this.newPasswordConfirmPin || this.newPasswordConfirmPin.length<4){
                let alert = this.alertCtrl.create({
                    title: '새비밀번호확인을 입력해 주시기 바랍니다.',
                    buttons: ['확인']
                  });
                  alert.present();
                  return;
    }

    if(this.newPasswordPin!=this.newPasswordConfirmPin){
                let alert = this.alertCtrl.create({
                    title: '새비밀번호와 새비밀번호확인이 일치하지 않습니다.',
                    buttons: ['확인']
                  });
                  alert.present();
                  return;

    }
    
    let reqbody:any={existingPin:this.existingPasswordPin,newPin:this.newPasswordPin};
    this.serverProvider.post("modifyPin",reqbody).then(()=>{
                let alert = this.alertCtrl.create({
                    title: '비밀번호가 변경되었습니다.',
                    buttons: ['확인']
                  });
                  alert.present();
                  return;
    },err=>{
        console.log("err??? "+err.indexOf("invalidPIN"));
        if(err.indexOf("invalidPIN")>=0){
                let alert = this.alertCtrl.create({
                    title: '기존 비밀번호가 일치하지 않습니다.',
                    buttons: ['확인']
                  });
                  alert.present();
                  return;
        }else{
                let alert = this.alertCtrl.create({
                    title:"비밀번호변경에 실패했습니다.",
                    subTitle: JSON.stringify(err),
                    buttons: ['확인']
                  });
                  alert.present();
                  return;            
        }
    })
  }

 close(){
     this.navCtrl.pop();
 }

 buttonPressed(val:number){
        console.log("cursor:"+this.cursor+" val:"+val);
        let password;
        let passwordInput;
        let cursor;

        if(this.currentInput=="existingPassword"){
            password=this.existingPassword;
            passwordInput=this.existingPasswordInput;
            cursor=this.existingCursor;
        }else if(this.currentInput=="newPassword"){
            password=this.newPassword;
            passwordInput=this.newPasswordInput;
            cursor=this.newPasswordCursor;            
        }else if(this.currentInput=="newPasswordConfirm"){
            password=this.newPasswordConfirm;
            passwordInput=this.newPasswordConfirmInput;
            cursor=this.newPasswordConfirmCursor; 
        }
        if(val==-1 ){
            console.log("val is -1");
            cursor = (cursor>=1) ? (cursor-1 ): cursor;
            password[cursor]=' ';
            passwordInput[cursor]=' ';
        }else if(val==-10){
            console.log("val is -10");
            for(var i=0;i<this.passwordLength;i++){
                password[i]=' ';
                passwordInput[i]=' ';
            }
            cursor = 0;
        }else if(cursor<this.passwordLength){
            if(cursor!=0){
              password[cursor-1]='*';
            }
            if(cursor==5){
                passwordInput[cursor]=val.toString();  
                password[cursor++]='*';
            }else{
                passwordInput[cursor]=val.toString();  
                password[cursor++]=val.toString();
            }
            console.log("password:"+password);
        }
        if(this.currentInput=="existingPassword"){
            this.existingPassword=password;
            this.existingPasswordInput=passwordInput;
            this.existingCursor=cursor;
        }else if(this.currentInput=="newPassword"){
            this.newPassword=password;
            this.newPasswordInput=passwordInput;
            this.newPasswordCursor=cursor;            
        }else if(this.currentInput=="newPasswordConfirm"){
            this.newPasswordConfirm=password;
            this.newPasswordConfirmInput=passwordInput;
            this.newPasswordConfirmCursor=cursor; 
        }     
        
        if(cursor==this.passwordLength){
              let pin="";
              pin=pin.concat(passwordInput[0],passwordInput[1],passwordInput[2],passwordInput[3]);
              console.log("pin:"+pin);
              if(this.currentInput=="existingPassword"){
                    this.existingPasswordPin=pin;
                    this.currentInput="newPassword";
                    this.existingPassword[3]="*";
              }else if(this.currentInput=="newPassword"){
                    this.newPasswordPin=pin;
                    this.currentInput="newPasswordConfirm";
                    this.newPassword[3]="*";
              }else if(this.currentInput=="newPasswordConfirm"){
                    this.newPasswordConfirmPin=pin;
                    this.newPasswordConfirm[3]="*";
              }
        }

  }



             
}
