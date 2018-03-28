import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import {ConfigProvider} from "../config/config";
/*
  Generated class for the StorageProvider provider.

  See https://angular.io/guide/dependency-injection for more info on providers
  and Angular DI.
*/
@Injectable()
export class StorageProvider {
  orderList=[];
  
  constructor(public http: HttpClient,public configProvider:ConfigProvider) {
    console.log('Hello StorageProvider Provider');
  }

}
