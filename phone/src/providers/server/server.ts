import { HttpClient } from '@angular/common/http';
import { Injectable,EventEmitter } from '@angular/core';
import {ConfigProvider} from "../config/config";
import {HTTP} from '@ionic-native/http'
import { NavController,LoadingController,AlertController,Platform } from 'ionic-angular';

import { BackgroundMode } from '@ionic-native/background-mode';
import { Push, PushObject, PushOptions } from '@ionic-native/push';
import { Events } from 'ionic-angular';

import {HttpWrapperProvider} from "../../providers/http-wrapper/http-wrapper";

/*
  Generated class for the ServerProvider provider.

  See https://angular.io/guide/dependency-injection for more info on providers
  and Angular DI.
*/
@Injectable()
export class ServerProvider {
  registrationId;
  pushNotification:PushObject;

  timeout:number=30; //in seconds;
  public progressBarLoader : any;
  
  event=new EventEmitter();

  constructor(//public http: HTTP,
              private httpWrapperProvider:HttpWrapperProvider,
              private push: Push,
              private platform: Platform,  
              public loadingCtrl: LoadingController,                            
              public alertCtrl:AlertController,                           
              private backgroundMode:BackgroundMode,
              //public configProvider:ConfigProvider,
              public events: Events) {

    console.log('Hello ServerProvider Provider');
          this.platform.ready().then(() => {
            this.backgroundMode.enable();
            this.pushNotification=this.push.init({
                android: {
                    senderID:'72197196442',
                },
                ios: {
                }
            });
            this.pushNotification.on('registration').subscribe((response:any)=>{
                this.registrationId=response.registrationId;
                console.log("registrationId:"+this.registrationId);
                if(!platform.is('ipad')){
                        this.pushNotification.subscribe("/topics/ricecake").then((data:any)=>{
                            console.log("subscribe /topics/ricecake once "+JSON.stringify(data));
                            /*
                            this.pushNotification.unsubscribe("/topics/ricecake").then((data:any)=>{
                                this.pushNotification.subscribe("/topics/ricecake").then((data:any)=>{
                                    console.log("subscribe /topics/ricecake twice "+JSON.stringify(data));
                                },error=>{
                                    console.log("subscribe failure in second turn")
                                });
                            },error=>{

                            });
                            */
                        },error=>{
                                console.log("subscribe failure in first turn")
                        });
                }else{ //iPad
                    console.log("iPad");
                    this.registerDeviceRegistrationId(this.registrationId).then(()=>{

                    },err=>{
                        let alert = this.alertCtrl.create({
                        title: '장치등록 오류입니다.',
                        subTitle:"주문확인전 업데이트버튼을 사용해 주시기 바랍니다."+JSON.stringify(err),
                        buttons: ['확인']
                        });
                        alert.present();
                    })
                }
            });

            this.pushNotification.on('notification').subscribe((data:any)=>{
                    console.log("pushNotification.on-data:"+JSON.stringify(data));
                    if(data.additionalData.registrationId && data.additionalData.registrationId==this.registrationId){
                        console.log("just ignore it");
                    }else{
                        console.log("publish update");
                        this.events.publish('update',data.additionalData.table);
                        this.event.emit(data.additionalData.table); // 이 코드가 들어가야 위에 코드가 수행되는것같다 ㅜㅜ 
                    }
            });
            this.pushNotification.on('error').subscribe((e:any)=>{
                console.log("!!! notification error:"+e.message);
                let alert = this.alertCtrl.create({
                  title: '장치등록 오류입니다.',
                  subTitle:"변경 사항 확인을 위해 업데이트버튼을 사용해 주시기 바랍니다.",
                  buttons: ['확인']
                });
                alert.present();
            });            
        });

  }

  registerDeviceRegistrationId(registrationId){
      return new Promise((resolve,reject)=>{    
          let body = {registrationId:this.registrationId,android:this.platform.is("android")};
          //this.http.setDataSerializer("json"); 
          //this.http.post(this.configProvider.serverAddress+"/registerDeviceRegistrationId",body, {"Content-Type":"application/json"}).then((res:any)=>{
            this.httpWrapperProvider.post("/registerDeviceRegistrationId",body).then((response:any)=>{
                  //let response=JSON.parse(res.data);            
                  if(response.result=="success"){
                      console.log("registerDeviceRegistrationId Success");
                      resolve();
                  }else{
                    if(response.error)
                      reject(response.error);
                    else
                      reject("unknown error in server");
                  }
          },(err)=>{
                console.log("err:"+JSON.stringify(err));
                reject(err);            
          });            
      });      
  }

  getOrders(deliveryDate){ 
      return new Promise((resolve,reject)=>{
          // deliveryDate: deliveryTime.substring(0,10)
          let body ={deliveryDate: deliveryDate,registrationId:this.registrationId};    
          //this.http.setDataSerializer("json"); 
          //this.http.setRequestTimeout(this.timeout);

          let progressBarLoader = this.loadingCtrl.create({
            content: "진행중입니다.",
            duration: this.timeout*1000
            });
          //progressBarLoader.present();
          
          this.httpWrapperProvider.post("/getOrderWithDeliveryDate",body).then((response:any)=>{              
              //progressBarLoader.dismiss();
              //console.log("res:"+JSON.stringify(res));
              //let response=JSON.parse(res.data);
              console.log("getOrderWithDeliverDate response: " + JSON.stringify(response));
              if(response.result=="success"){
                    resolve(response.orders);
              }else{
                    if(response.error)
                      reject(response.error);
                    else
                      reject("unknown error in server");
              }
          },(err)=>{
              //progressBarLoader.dismiss();
                console.log("err:"+JSON.stringify(err));
                reject(err);
          });
      });
  }
  
  getOrdersInTrash(){
      return new Promise((resolve,reject)=>{
          let body ={registrationId:this.registrationId};    
          //this.http.setDataSerializer("json"); 
          //this.http.setRequestTimeout(this.timeout);

          let progressBarLoader = this.loadingCtrl.create({
            content: "진행중입니다.",
            duration: this.timeout*1000
            });
          progressBarLoader.present();

          this.httpWrapperProvider.post("/getOrdersWithHide",body).then((response:any)=>{              
              progressBarLoader.dismiss();
              //console.log("res:"+JSON.stringify(res));
              //let response=JSON.parse(res.data);
              console.log("getOrdersWithHide response: " + JSON.stringify(response));
              if(response.result=="success"){
                    resolve(response.orders);
              }else{
                    if(response.error)
                      reject(response.error);
                    else
                      reject("unknown error in server");
              }
          },(err)=>{
                progressBarLoader.dismiss();
                console.log("err:"+JSON.stringify(err));
                reject(err);
          });
      });
  }

  saveOrder(orderIn){
      return new Promise((resolve,reject)=>{    
          let order= Object.assign({}, orderIn); 
          order.deliveryTime=order.deliveryTime.substr(0,16)+":00.000Z"; //dynamoDB format으로 변경한다.
          console.log("deliveryTime:"+order.deliveryTime);
          let body = {order:order,registrationId:this.registrationId};
          //this.http.setDataSerializer("json"); 
          //this.http.setRequestTimeout(this.timeout);
          let progressBarLoader = this.loadingCtrl.create({
            content: "진행중입니다.",
            duration: this.timeout*1000
            });
          progressBarLoader.present();
          
          this.httpWrapperProvider.post("/addOrder",body).then((response:any)=>{
                  progressBarLoader.dismiss();
                  //let response=JSON.parse(res.data);            
                  if(response.result=="success"){
                      console.log("Order Save Success");
                      resolve();
                  }else{
                    console.log("error:"+JSON.stringify(response));
                    if(response.error)
                      reject(response.error);
                    else
                      reject("unknown error in server");
                  }
          },(err)=>{
                progressBarLoader.dismiss();            
                console.log("err:"+JSON.stringify(err));
                reject(err);            
          });            
      });
  }


  updateOrder(orderIn){
      return new Promise((resolve,reject)=>{  
          
          let order= Object.assign({}, orderIn); 
          order.deliveryTime=order.deliveryTime.substr(0,16)+":00.000Z"; //dynamoDB format으로 변경한다.
          console.log("deliveryTime:"+order.deliveryTime);

          let body = {order:order,registrationId:this.registrationId};
          //this.http.setDataSerializer("json"); 
          //this.http.setRequestTimeout(this.timeout);
          let progressBarLoader = this.loadingCtrl.create({
            content: "진행중입니다.",
            duration: this.timeout*1000
            });
          progressBarLoader.present();
          
          this.httpWrapperProvider.post("/updateOrder",body).then((response:any)=>{
                  progressBarLoader.dismiss();
                  //let response=JSON.parse(res.data);            
                  if(response.result=="success"){
                      console.log("Order Update Success");
                      resolve();
                  }else{
                    if(response.error)
                      reject(response.error);
                    else
                      reject("unknown error in server");
                  }
          },(err)=>{
                progressBarLoader.dismiss();
                console.log("err:"+JSON.stringify(err));
                reject(err);            
          });            
      });      
  }

  deleteOrders(){
      return new Promise((resolve,reject)=>{    
          let body = {registrationId:this.registrationId};
          //this.http.setDataSerializer("json"); 
          //this.http.setRequestTimeout(this.timeout);
          let progressBarLoader = this.loadingCtrl.create({
            content: "진행중입니다.",
            duration: this.timeout*1000
            });
          //progressBarLoader.present();
          
          this.httpWrapperProvider.post("/deleteOrders",body).then((response:any)=>{
                  //progressBarLoader.dismiss();
                  //let response=JSON.parse(res.data);            
                  if(response.result=="success"){
                      console.log("deleteOrders Success");
                      resolve();
                  }else{
                    if(response.error)
                      reject(response.error);
                    else
                      reject("unknown error in server");
                  }
          },(err)=>{
                //progressBarLoader.dismiss();            
                console.log("err:"+JSON.stringify(err));
                reject(err);            
          });            
      });      
    
  }

  hideOrder(id){
      return new Promise((resolve,reject)=>{    
          let body = {id:id,registrationId:this.registrationId};
          //this.http.setDataSerializer("json"); 
          //this.http.setRequestTimeout(this.timeout);
          let progressBarLoader = this.loadingCtrl.create({
            content: "진행중입니다.",
            duration: this.timeout*1000
            });
          progressBarLoader.present();
          
          this.httpWrapperProvider.post("/hideOrder",body).then((response:any)=>{
                  progressBarLoader.dismiss();
                  //let response=JSON.parse(res.data);            
                  if(response.result=="success"){
                      console.log("hideOrder Success");
                      resolve();
                  }else{
                    if(response.error)
                      reject(response.error);
                    else
                      reject("unknown error in server");
                  }
          },(err)=>{
                progressBarLoader.dismiss();            
                console.log("err:"+JSON.stringify(err));
                reject(err);            
          });            
      });      
  }

  showOrder(id){
      return new Promise((resolve,reject)=>{    
          let body = {id:id,registrationId:this.registrationId};
          //this.http.setDataSerializer("json"); 
          //this.http.setRequestTimeout(this.timeout);
          let progressBarLoader = this.loadingCtrl.create({
            content: "진행중입니다.",
            duration: this.timeout*1000
            });
          progressBarLoader.present();
          
          this.httpWrapperProvider.post("/showOrder",body).then((response:any)=>{
                  progressBarLoader.dismiss();
                  //let response=JSON.parse(res.data);            
                  if(response.result=="success"){
                      console.log("showOrder Success");
                      resolve();
                  }else{
                    if(response.error)
                      reject(response.error);
                    else
                      reject("unknown error in server");
                  }
          },(err)=>{
                progressBarLoader.dismiss();
                console.log("err:"+JSON.stringify(err));
                reject(err);            
          });            
      });      
  }

  assignCarrier(orderid,carrier){
      return new Promise((resolve,reject)=>{    
          let body = {orderid:orderid,carrier:carrier,registrationId:this.registrationId};
          //this.http.setDataSerializer("json");
          //this.http.setRequestTimeout(this.timeout);
          let progressBarLoader = this.loadingCtrl.create({
            content: "진행중입니다.",
            duration: this.timeout*1000
            });
          progressBarLoader.present();
           
          this.httpWrapperProvider.post("/assignCarrier",body).then((response:any)=>{
                  progressBarLoader.dismiss();
                  //let response=JSON.parse(res.data);            
                  if(response.result=="success"){
                      console.log("assignCarrier Success");
                      resolve();
                  }else{
                    if(response.error)
                      reject(response.error);
                    else
                      reject("unknown error in server");
                  }
          },(err)=>{
                progressBarLoader.dismiss();
                console.log("err:"+JSON.stringify(err));
                reject(err);            
          });            
      });      

  } 

  addCarrier(name,date){
      return new Promise((resolve,reject)=>{    
          let body = {name:name,date:date,registrationId:this.registrationId};
          //this.http.setDataSerializer("json"); 
          //this.http.setRequestTimeout(this.timeout);
          let progressBarLoader = this.loadingCtrl.create({
            content: "진행중입니다.",
            duration: this.timeout*1000
            });
          progressBarLoader.present();
          
          this.httpWrapperProvider.post("/addCarrier",body).then((response:any)=>{
                  progressBarLoader.dismiss();
                  //let response=JSON.parse(res.data);            
                  if(response.result=="success"){
                      console.log("addCarrier Success");
                      resolve();
                  }else{
                    if(response.error)
                      reject(response.error);
                    else
                      reject("unknown error in server");
                  }
          },(err)=>{
                progressBarLoader.dismiss();
                console.log("err:"+JSON.stringify(err));
                reject(err);            
          });            
      });            
    
  }

  deleteCarrier(name,date){
      return new Promise((resolve,reject)=>{        
          let body = {name:name,date:date,registrationId:this.registrationId};
          //this.http.setDataSerializer("json"); 
          //this.http.setRequestTimeout(this.timeout);
          let progressBarLoader = this.loadingCtrl.create({
            content: "진행중입니다.",
            duration: this.timeout*1000
            });
          progressBarLoader.present();
          
          this.httpWrapperProvider.post("/deleteCarrier",body).then((response:any)=>{
                  progressBarLoader.dismiss();
                  //let response=JSON.parse(res.data);            
                  if(response.result=="success"){
                      console.log("deleteCarrier Success");
                      resolve();
                  }else{
                    if(response.error)
                      reject(response.error);
                    else
                      reject("unknown error in server");
                  }
          },(err)=>{
                progressBarLoader.dismiss();
                console.log("err:"+JSON.stringify(err));
                reject(err);            
          });            
      });    
  }

  getCarriers(date){
      return new Promise((resolve,reject)=>{        
          let body = {date:date,registrationId:this.registrationId};
          //this.http.setDataSerializer("json"); 
          //this.http.setRequestTimeout(this.timeout);
          let progressBarLoader = this.loadingCtrl.create({
            content: "진행중입니다.",
            duration: this.timeout*1000
            });
          //progressBarLoader.present();
          
          this.httpWrapperProvider.post("/getCarriers",body).then((response:any)=>{
                  //progressBarLoader.dismiss();
                  //let response=JSON.parse(res.data);            
                  if(response.result=="success"){
                      console.log("getCarriers Success");
                      let carriers=response.carriers;
                      carriers.sort(function(a,b){
                        if(a <b)
                            return -1;
                        if(a>b)
                            return 1;
                        return 0;    
                      })
                      resolve(carriers);
                  }else{
                    if(response.error)
                      reject(response.error);
                    else
                      reject("unknown error in server");
                  }
          },(err)=>{
                //progressBarLoader.dismiss();
                console.log("err:"+JSON.stringify(err));
                reject(err);            
          });            
      });   
  }

  //////////////////////
  addMenu(category,name){
      return new Promise((resolve,reject)=>{    
          let body = {category:category,menu:name,registrationId:this.registrationId};
          //this.http.setDataSerializer("json"); 
          //this.http.setRequestTimeout(this.timeout);
          let progressBarLoader = this.loadingCtrl.create({
            content: "진행중입니다.",
            duration: this.timeout*1000
            });
          progressBarLoader.present();
          
          this.httpWrapperProvider.post("/addMenu",body).then((response:any)=>{
                  progressBarLoader.dismiss();
                  //let response=JSON.parse(res.data);            
                  if(response.result=="success"){
                      console.log("addMenu Success");
                      resolve();
                  }else{
                    if(response.error)
                      reject(response.error);
                    else
                      reject("unknown error in server");
                  }
          },(err)=>{
                progressBarLoader.dismiss();            
                console.log("err:"+JSON.stringify(err));
                reject(err);            
          });            
      });            
  }

  deleteMenu(category,name){
      return new Promise((resolve,reject)=>{    
          let body = {category:category,menu:name,registrationId:this.registrationId};
          console.log("body:"+JSON.stringify(body));
          //this.http.setDataSerializer("json"); 
          //this.http.setRequestTimeout(this.timeout);
          let progressBarLoader = this.loadingCtrl.create({
            content: "진행중입니다.",
            duration: this.timeout*1000
            });
          progressBarLoader.present();
          
          this.httpWrapperProvider.post("/deleteMenu",body).then((response:any)=>{
                  progressBarLoader.dismiss();
                  //let response=JSON.parse(res.data);            
                  if(response.result=="success"){
                      console.log("deleteMenu Success");
                      resolve();
                  }else{
                    if(response.error)
                      reject(response.error);
                    else
                      reject("unknown error in server");
                  }
          },(err)=>{
                progressBarLoader.dismiss();            
                console.log("err:"+JSON.stringify(err));
                reject(err);            
          });            
      });            
  }

  getMenus(){
      return new Promise((resolve,reject)=>{    
          let body = {registrationId:this.registrationId};
          //this.http.setDataSerializer("json"); 
          //this.http.setRequestTimeout(this.timeout);
          let progressBarLoader = this.loadingCtrl.create({
            content: "진행중입니다.",
            duration: this.timeout*1000
            });
          //progressBarLoader.present();
          
          this.httpWrapperProvider.post("/getMenus",body).then((response:any)=>{
                  //progressBarLoader.dismiss();
                  //let response=JSON.parse(res.data);            
                  if(response.result=="success"){
                      console.log("getMenus Success");
                      resolve(response.menus);
                  }else{
                    if(response.error)
                      reject(response.error);
                    else
                      reject("unknown error in server");
                  }
          },(err)=>{
                //progressBarLoader.dismiss();            
                console.log("err:"+JSON.stringify(err));
                reject(err);            
          });            
      });            
  }

  getSalesWithBuyer(startDate,endDate,buyer){
      return new Promise((resolve,reject)=>{    
          let body = {startDate:startDate,endDate:endDate,buyer:buyer.trim(),registrationId:this.registrationId};
          //this.http.setDataSerializer("json"); 
          //this.http.setRequestTimeout(this.timeout);
          let progressBarLoader = this.loadingCtrl.create({
            content: "진행중입니다.",
            duration: this.timeout*1000
            });
          progressBarLoader.present();
          
          this.httpWrapperProvider.post("/getSalesWithBuyer",body).then((response:any)=>{
                  progressBarLoader.dismiss();
                  //let response=JSON.parse(res.data);            
                  if(response.result=="success"){
                      console.log("getSales Success");
                      resolve(response.sales);
                  }else{
                    if(response.error)
                      reject(response.error);
                    else
                      reject("unknown error in server");
                  }
          },(err)=>{
                progressBarLoader.dismiss();
                console.log("err:"+JSON.stringify(err));
                reject(err);            
          });            
      });
  }

  getSales(startDate,endDate){
      return new Promise((resolve,reject)=>{    
          let body = {startDate:startDate,endDate:endDate,registrationId:this.registrationId};
          //this.http.setDataSerializer("json"); 
          //this.http.setRequestTimeout(this.timeout);
          let progressBarLoader = this.loadingCtrl.create({
            content: "진행중입니다.",
            duration: this.timeout*1000
            });
          progressBarLoader.present();
          
          this.httpWrapperProvider.post("/getSales",body).then((response:any)=>{
                  progressBarLoader.dismiss();
                  //let response=JSON.parse(res.data);            
                  if(response.result=="success"){
                      console.log("getSales Success");
                      resolve(response.sales);
                  }else{
                    if(response.error)
                      reject(response.error);
                    else
                      reject("unknown error in server");
                  }
          },(err)=>{
                progressBarLoader.dismiss();
                console.log("err:"+JSON.stringify(err));
                reject(err);            
          });            
      });
  }

checkPIN(pin){
      return new Promise((resolve,reject)=>{    
          let body = {pin:pin,registrationId:this.registrationId};
          //this.http.setDataSerializer("json"); 
          //this.http.setRequestTimeout(this.timeout);
          let progressBarLoader = this.loadingCtrl.create({
            content: "진행중입니다.",
            duration: this.timeout*1000
            });
          progressBarLoader.present();
          
          this.httpWrapperProvider.post("/checkPIN",body).then((response:any)=>{
                  progressBarLoader.dismiss();
                  //let response=JSON.parse(res.data);            
                  if(response.result=="success"){
                      resolve();
                  }else{
                    if(response.error)
                      reject(response.error);
                    else
                      reject("unknown error in server");
                  }
          },(err)=>{
                progressBarLoader.dismiss();            
                console.log("err:"+JSON.stringify(err));
                reject(err);            
          });            
      });
  }
  
  checkInstallPIN(pin){
      return new Promise((resolve,reject)=>{    
          let body = {pin:pin,registrationId:this.registrationId};
          //this.http.setDataSerializer("json"); 
          //this.http.setRequestTimeout(this.timeout);
          let progressBarLoader = this.loadingCtrl.create({
            content: "진행중입니다.",
            duration: this.timeout*1000
            });
          progressBarLoader.present();
          
          this.httpWrapperProvider.post("/checkInstallPIN",body).then((response:any)=>{
                  progressBarLoader.dismiss();
                  //let response=JSON.parse(res.data);            
                  if(response.result=="success"){
                      resolve();
                  }else{
                    if(response.error)
                      reject(response.error);
                    else
                      reject("unknown error in server");
                  }
          },(err)=>{
                progressBarLoader.dismiss();            
                console.log("err:"+JSON.stringify(err));
                reject(err);            
          });            
      });
  }

  post(request,bodyIn){
      return new Promise((resolve,reject)=>{ 
          let body=bodyIn;
          body["registrationId"]=this.registrationId;
          console.log("server-post body:"+JSON.stringify(body));
          //this.http.setDataSerializer("json"); 
          //this.http.setRequestTimeout(this.timeout);
          let progressBarLoader = this.loadingCtrl.create({
            content: "진행중입니다.",
            duration: this.timeout*1000
            });
          progressBarLoader.present();
          //console.log("serverAddr: "+this.configProvider.serverAddress+request);

          this.httpWrapperProvider.post("/"+request,body).then((response:any)=>{
                  progressBarLoader.dismiss();
                  //let response=JSON.parse(res.data);            
                  if(response.result=="success"){
                      resolve(response);
                  }else{
                    if(response.error)
                      reject(response.error);
                    else
                      reject("unknown error in server");
                  }
          },(err)=>{
                progressBarLoader.dismiss();            
                console.log("err:"+JSON.stringify(err));
                reject(err);            
          });            
      });
  }
  
}

