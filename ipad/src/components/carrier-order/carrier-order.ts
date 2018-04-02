import { Component,Input,Output,EventEmitter } from '@angular/core';
import { AlertController } from 'ionic-angular';
import {StorageProvider} from '../../providers/storage/storage';
/**
 * Generated class for the CarrierOrderComponent component.
 *
 * See https://angular.io/api/core/Component for more info on Angular
 * Components.
 */
@Component({
  selector: 'carrier-order',
  templateUrl: 'carrier-order.html'
})
export class CarrierOrderComponent {
 @Input('order') orderIn:any;
 @Output("output") output= new EventEmitter();
 
 order;

 carrier:string; //carrier update
  modification:boolean=false;
  constructor(public alertCtrl:AlertController,public storageProvider:StorageProvider) {
    console.log('Hello CarrierOrderComponent Component');
  }

  ngOnInit() { 
    this.order = Object.assign({}, this.orderIn); // copy object. Very important!!!! 아주 중요하다. 입력값은 사용하지 않는다.
    this.carrier=this.order.carrier;
  }

  modifyCarrier(){
    this.modification=true;
  }

  saveCarrier(){
    if(this.order.carrier==this.carrier){
      let alert = this.alertCtrl.create({
          title:'수정사항이 없습니다.',
          buttons: ['확인']
      });
      alert.present();
    }else{
        this.order.updateCarrier=this.carrier;
        this.output.emit(this.order);      
    }
    this.modification=false;
  }
}
