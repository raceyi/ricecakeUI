import { Component ,Input,Output,EventEmitter} from '@angular/core';
import { NavController,AlertController } from 'ionic-angular';

/**
 * Generated class for the ExistingOrderComponent component.
 *
 * See https://angular.io/api/core/Component for more info on Angular
 * Components.
 */
@Component({
  selector: 'existing-order',
  templateUrl: 'existing-order.html'
})
export class ExistingOrderComponent {
 @Input('order') order:any;
 @Output("output") output= new EventEmitter();
 @Output("modify") modify= new EventEmitter();

  constructor(public alertCtrl:AlertController) {
    console.log('Hello ExistingOrderComponent Component');
  }

  modifyOrder(order) {
      this.output.emit(this.order);
  };

  IsComplexMenu(menu){
    if(menu.menu.indexOf("[") == 0 && !menu.choiceNumber)
        return true;
    return false;    
  }
  getPaymentBackground(paymentString){
    //console.log("getPaymentBackground");
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
