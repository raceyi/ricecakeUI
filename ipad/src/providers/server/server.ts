import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import {ConfigProvider} from "../config/config";

/*
  Generated class for the ServerProvider provider.

  See https://angular.io/guide/dependency-injection for more info on providers
  and Angular DI.
*/
@Injectable()
export class ServerProvider {

  
  constructor(public http: HttpClient,public configProvider:ConfigProvider) {
    console.log('Hello ServerProvider Provider');
  }

  getOrders(){


  }
  
  saveOrder(order){
    
  }
}
