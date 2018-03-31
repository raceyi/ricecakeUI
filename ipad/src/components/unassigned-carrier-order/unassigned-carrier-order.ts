import { Component ,Input,Output,EventEmitter} from '@angular/core';
import {StorageProvider} from '../../providers/storage/storage';
import { NavController,AlertController } from 'ionic-angular';

/**
 * Generated class for the UnassignedCarrierOrderComponent component.
 *
 * See https://angular.io/api/core/Component for more info on Angular
 * Components.
 */
@Component({
  selector: 'unassigned-carrier-order',
  templateUrl: 'unassigned-carrier-order.html'
})
export class UnassignedCarrierOrderComponent {

  @Input('order') order:any;
  @Output("output") output= new EventEmitter();

  constructor(public storageProvider:StorageProvider,public alertCtrl:AlertController) {
    console.log('Hello UnassignedCarrierOrderComponent Component');
  }

  assingCarrier(order){
        if(order.carrier){
              this.output.emit(this.order);      
        }else{
            let alert = this.alertCtrl.create({
              title: '배달원을 선택해 주시기 바랍니다.',
              buttons: ['확인']
            });
            alert.present();
        }   
  }  
}
