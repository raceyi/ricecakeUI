import { Component,Input,Output,EventEmitter } from '@angular/core';
import { AlertController } from 'ionic-angular';
import {StorageProvider} from '../../providers/storage/storage';

/**
 * Generated class for the PhoneCarrierOrderComponent component.
 *
 * See https://angular.io/api/core/Component for more info on Angular
 * Components.
 */
@Component({
  selector: 'phone-carrier-order',
  templateUrl: 'phone-carrier-order.html'
})
export class PhoneCarrierOrderComponent {

 @Input('order') orderIn:any;
 @Output("output") output= new EventEmitter();
 @Output("modify") modify= new EventEmitter();

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

  modifyCarrier(){           // 정말 필요한가?
    this.modification=true;
  }

  IsComplexMenu(menu){
    if(menu.type && menu.type=="complex")
        return true;
    return false;    
  }

  saveCarrier(){
    if(this.order.carrier==this.carrier){
      let alert = this.alertCtrl.create({
          title:'수정사항이 없습니다.',
          buttons: ['확인']
      });
      alert.present();
    }else{
        //if(this.carrier=="미지정")
        //   this.order.updateCarrier="";
        this.order.updateCarrier=this.carrier;        
        this.output.emit(this.order);      
    }
    this.modification=false;
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
