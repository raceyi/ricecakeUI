import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import {ConfigProvider} from "../config/config";
import {HTTP} from '@ionic-native/http'

/*
  Generated class for the ServerProvider provider.

  See https://angular.io/guide/dependency-injection for more info on providers
  and Angular DI.
*/
@Injectable()
export class ServerProvider {
  registrationId;
  
  constructor(public http: HTTP,public configProvider:ConfigProvider) {
    console.log('Hello ServerProvider Provider');
  }

  getOrders(deliveryDate){ 
      return new Promise((resolve,reject)=>{
          // deliveryDate: deliveryTime.substring(0,10)
          let body ={deliveryDate: deliveryDate,registrationId:this.registrationId};    
          this.http.setDataSerializer("json"); 

          this.http.post(this.configProvider.serverAddress+"/getOrderWithDeliveryDate",body,{"Content-Type":"application/json"}).then((res:any)=>{              
              console.log("res:"+JSON.stringify(res));
              let response=JSON.parse(res.data);
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
                console.log("err:"+JSON.stringify(err));
                reject(err);
          });
      });
  }
  
  saveOrder(order){
      return new Promise((resolve,reject)=>{    
          let body = {order:order,registrationId:this.registrationId};
          this.http.setDataSerializer("json"); 
          this.http.post(this.configProvider.serverAddress+"/addOrder",body, {"Content-Type":"application/json"}).then((res:any)=>{
                  let response=JSON.parse(res.data);            
                  if(response.result=="success"){
                      console.log("Order Save Success");
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


  updateOrder(order){
      return new Promise((resolve,reject)=>{    
          let body = {order:order,registrationId:this.registrationId};
          this.http.setDataSerializer("json"); 
          this.http.post(this.configProvider.serverAddress+"/updateOrder",body, {"Content-Type":"application/json"}).then((res:any)=>{
                  let response=JSON.parse(res.data);            
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
                console.log("err:"+JSON.stringify(err));
                reject(err);            
          });            
      });      
  }

  deleteOrders(){
      return new Promise((resolve,reject)=>{    
          let body = {registrationId:this.registrationId};
          this.http.setDataSerializer("json"); 
          this.http.post(this.configProvider.serverAddress+"/deleteOrders",body, {"Content-Type":"application/json"}).then((res:any)=>{
                  let response=JSON.parse(res.data);            
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
                console.log("err:"+JSON.stringify(err));
                reject(err);            
          });            
      });      
    
  }

  hideOrder(id){
      return new Promise((resolve,reject)=>{    
          let body = {id:id,registrationId:this.registrationId};
          this.http.setDataSerializer("json"); 
          this.http.post(this.configProvider.serverAddress+"/hideOrder",body, {"Content-Type":"application/json"}).then((res:any)=>{
                  let response=JSON.parse(res.data);            
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
                console.log("err:"+JSON.stringify(err));
                reject(err);            
          });            
      });      
  }

  showOrder(id){
      return new Promise((resolve,reject)=>{    
          let body = {id:id,registrationId:this.registrationId};
          this.http.setDataSerializer("json"); 
          this.http.post(this.configProvider.serverAddress+"/showOrder",body, {"Content-Type":"application/json"}).then((res:any)=>{
                  let response=JSON.parse(res.data);            
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
                console.log("err:"+JSON.stringify(err));
                reject(err);            
          });            
      });      
  }

  assignCarrier(orderid,carrier){
      return new Promise((resolve,reject)=>{    
          let body = {orderid:orderid,carrier:carrier,registrationId:this.registrationId};
          this.http.setDataSerializer("json"); 
          this.http.post(this.configProvider.serverAddress+"/assignCarrier",body, {"Content-Type":"application/json"}).then((res:any)=>{
                  let response=JSON.parse(res.data);            
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
                console.log("err:"+JSON.stringify(err));
                reject(err);            
          });            
      });      

  } 

  addCarrier(name){
      return new Promise((resolve,reject)=>{    
          let body = {name:name,registrationId:this.registrationId};
          this.http.setDataSerializer("json"); 
          this.http.post(this.configProvider.serverAddress+"/addCarrier",body, {"Content-Type":"application/json"}).then((res:any)=>{
                  let response=JSON.parse(res.data);            
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
                console.log("err:"+JSON.stringify(err));
                reject(err);            
          });            
      });            
    
  }

  deleteCarrier(name){
      return new Promise((resolve,reject)=>{        
          let body = {name:name,registrationId:this.registrationId};
          this.http.setDataSerializer("json"); 
          this.http.post(this.configProvider.serverAddress+"/deleteCarrier",body, {"Content-Type":"application/json"}).then((res:any)=>{
                  let response=JSON.parse(res.data);            
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
                console.log("err:"+JSON.stringify(err));
                reject(err);            
          });            
      });    
  }

  getCarriers(){
      return new Promise((resolve,reject)=>{        
          let body = {registrationId:this.registrationId};
          this.http.setDataSerializer("json"); 
          this.http.post(this.configProvider.serverAddress+"/getCarriers",body, {"Content-Type":"application/json"}).then((res:any)=>{
                  let response=JSON.parse(res.data);            
                  if(response.result=="success"){
                      console.log("getCarriers Success");
                      resolve(response.carriers);
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

  //////////////////////
  addMenu(category,name){
      return new Promise((resolve,reject)=>{    
          let body = {category:category,name:name,registrationId:this.registrationId};
          this.http.setDataSerializer("json"); 
          this.http.post(this.configProvider.serverAddress+"/addMenu",body, {"Content-Type":"application/json"}).then((res:any)=>{
                  let response=JSON.parse(res.data);            
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
                console.log("err:"+JSON.stringify(err));
                reject(err);            
          });            
      });            
  }

  deleteMenu(category,name){
      return new Promise((resolve,reject)=>{    
          let body = {category:category,name:name,registrationId:this.registrationId};
          this.http.setDataSerializer("json"); 
          this.http.post(this.configProvider.serverAddress+"/deleteMenu",body, {"Content-Type":"application/json"}).then((res:any)=>{
                  let response=JSON.parse(res.data);            
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
                console.log("err:"+JSON.stringify(err));
                reject(err);            
          });            
      });            
  }

  getMenus(){
      return new Promise((resolve,reject)=>{    
          let body = {registrationId:this.registrationId};
          this.http.setDataSerializer("json"); 
          this.http.post(this.configProvider.serverAddress+"/getMenus",body, {"Content-Type":"application/json"}).then((res:any)=>{
                  let response=JSON.parse(res.data);            
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
                console.log("err:"+JSON.stringify(err));
                reject(err);            
          });            
      });            
  }
  getSales(startDate,endDate){
        // cashPaid,cardPaid,cardUnpaid,cashUnpaid
      return new Promise((resolve,reject)=>{    
          let body = {startDate:startDate,endDate:endDate,registrationId:this.registrationId};
          this.http.setDataSerializer("json"); 
          this.http.post(this.configProvider.serverAddress+"/getSales",body, {"Content-Type":"application/json"}).then((res:any)=>{
                  let response=JSON.parse(res.data);            
                  if(response.result=="success"){
                      console.log("getSales Success");
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

  getSalesWithBuyer(startDate,endDate,buyer){
      return new Promise((resolve,reject)=>{    
          let body = {startDate:startDate,endDate:endDate,buyer:buyer,registrationId:this.registrationId};
          this.http.setDataSerializer("json"); 
          this.http.post(this.configProvider.serverAddress+"/getSalesWithBuyer",body, {"Content-Type":"application/json"}).then((res:any)=>{
                  let response=JSON.parse(res.data);            
                  if(response.result=="success"){
                      console.log("getSales Success");
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

  
}
