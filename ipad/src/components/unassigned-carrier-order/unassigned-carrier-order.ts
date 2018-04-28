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
  @Output("modify") modify= new EventEmitter();

  constructor(public storageProvider:StorageProvider,public alertCtrl:AlertController) {
    console.log('Hello UnassignedCarrierOrderComponent Component');
  }

  IsComplexMenu(menu){
    if(menu.type && menu.type=="complex")
        return true;
    return false;    
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
getPaymentBackground(paymentString){
    //console.log("getPaymentBackground");
    if(paymentString=="카드기")
       return {"color":"#0000ff"};    
    if(this.order.payment.startsWith("paid"))
        return {"color":'#ff0000'};
    else 
        return {};     
 }

  completePayment(){
                let alert = this.alertCtrl.create({
                  title: '돈을 수령하셨습니까?',
                  buttons: [
                  {
                    text: '아니오',
                    handler: () => {
                      return;
                    }
                  },
                  {
                    text: '네',
                    handler: () => {
                      console.log('agree clicked');
                      
                      this.modify.emit(this.order);    
                      return;
                    }
                  }]
                });
                alert.present();
                return;
  }

}
