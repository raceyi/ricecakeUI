import { Component } from '@angular/core';
import { IonicPage, NavController, NavParams ,AlertController} from 'ionic-angular';

/**
 * Generated class for the TrashPasswordPage page.
 *
 * See https://ionicframework.com/docs/components/#navigation for more info on
 * Ionic pages and navigation.
 */

@IonicPage()
@Component({
  selector: 'page-trash-password',
  templateUrl: 'trash-password.html',
})
export class TrashPasswordPage {
  callback;

  passwordLength:number=4;
  passwordInput=['',' ',' ',' '];
  password=[' ',' ',' ',' '];
  cursor:number=0;

  constructor(public navCtrl: NavController, 
              public alertCtrl:AlertController,
              public navParams: NavParams) {
     this.callback = this.navParams.get("callback");                
  }

  ionViewDidLoad() {
    console.log('ionViewDidLoad TrashPasswordPage');
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
              //Please call callback function
              let pin="";
              pin=pin.concat(this.passwordInput[0],this.passwordInput[1],this.passwordInput[2],
                            this.passwordInput[3]);
              console.log("pin:"+pin);
            this.callback(pin).then(()=>{
                  this.navCtrl.pop();
            });     
        }
  }

  close(){
      this.navCtrl.pop();
  }
}
