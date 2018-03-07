import { Component } from '@angular/core';
import { NavController,Platform,AlertController } from 'ionic-angular';
import { InAppBrowser } from '@ionic-native/in-app-browser';
import { Printer, PrintOptions } from '@ionic-native/printer';

var gPage;

@Component({
  selector: 'page-home',
  templateUrl: 'home.html'
})
export class HomePage {
  display:string="order";

  browserRef;
  done:boolean=false;
  redirectUrl="http://www.takit.biz";

  constructor(private platform: Platform,
               public alertCtrl:AlertController, 
              public navCtrl: NavController,
              private iab: InAppBrowser,
               private printer: Printer
              ) {
              
        platform.ready().then(() => {
          console.log("Platform ready comes at homePage");

          this.printer.isAvailable().then((avail)=>{
              console.log("avail:"+avail);
              this.printer.check().then((output)=>{
                console.log("output:"+JSON.stringify(output));
              },err=>{

              });
          }, (err)=>{
              console.log("err:"+JSON.stringify(err));
          });
    });
     gPage=this;
  }

  print(){
    
    var page = '<h1>Hello Document</h1>';

     
    let options: PrintOptions = {
        name: 'MyDocument',
        printerId: 'printer007',
        duplex: true,
        landscape: true,
        grayscale: true
      };

    this.printer.print(page, options).then((output)=>{
        console.log("print-output:"+JSON.stringify(output));
    },(err)=>{
        console.log("err:"+JSON.stringify(err));
    });
  }

  getJuso(){

    let localfile;
    if(this.platform.is('android')){
        console.log("android");
        localfile='file:///android_asset/www/assets/address.up.html';
    }else if(this.platform.is('ios')){
        console.log("ios");
        localfile='assets/address.up.html';
        //localfile='assets/address.html';
    }
        this.browserRef=this.iab.create(localfile,"_blank" ,'toolbarposition=top,location=no,presentationstyle=formsheet,closebuttoncaption=종료');

        this.browserRef.on("loadstart").subscribe((e) =>{
          if (e.url.startsWith(this.redirectUrl)) {
              gPage.done=true;            
              gPage.browserRef.close();
          }
        });

        this.browserRef.on("exit").subscribe( (e) => {
        });

  }
}
