import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import {HTTP} from '@ionic-native/http'
import { Platform } from 'ionic-angular';
import {ConfigProvider} from "../config/config";

/*
  Generated class for the HttpWrapperProvider provider.

  See https://angular.io/guide/dependency-injection for more info on providers
  and Angular DI.
*/
@Injectable()
export class HttpWrapperProvider {
  timeout:number=30; //in seconds;

  constructor(public client: HttpClient, 
              public http: HTTP,
              public configProvider:ConfigProvider,              
              public plt: Platform) {
    console.log('Hello HttpWrapperProvider Provider');
  }

  post(url,body){
      return new Promise((resolve,reject)=>{        
        if(this.plt.is("cordova")){ //use native-plugin
              this.http.setDataSerializer("json"); 
              this.http.setRequestTimeout(this.timeout);              
              this.http.post(this.configProvider.serverAddress+url,body, {"Content-Type":"application/json"}).then((res:any)=>{
                  resolve(JSON.parse(res.data));
              },err=>{
                  reject(err);
              });             
        }else{ // use httpClient
            let address="http://localhost:8100"+url;
            console.log("address:"+address);
            this.client.post(address,body).subscribe((res:any)=>{
                resolve(res);
            },(err)=>{
                console.log("post-err:"+JSON.stringify(err));
            });
        }
      });
  }
}
