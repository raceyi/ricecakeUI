import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';

/*
  Generated class for the ConfigProvider provider.

  See https://angular.io/guide/dependency-injection for more info on providers
  and Angular DI.
*/
@Injectable()
export class ConfigProvider {
  //serverAddress="https://8ca0a9qq5g.execute-api.ap-northeast-2.amazonaws.com/latest";
  serverAddress="http://192.168.0.8:3000";
  
  constructor(public http: HttpClient) {
    console.log('Hello ConfigProvider Provider');
  }

}
