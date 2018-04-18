import { Component ,Input,Output,EventEmitter} from '@angular/core';

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

  constructor() {
    console.log('Hello ExistingOrderComponent Component');
  }

  ngOnInit() { 
    console.log('ExistingOrderComponent Component '+JSON.stringify(this.order));  
}

  modifyOrder(order) {
      console.log("modifyOrder comes");
      this.output.emit({operation:"modify",order:this.order});
  };

 deleteOrder(){
      this.output.emit({operation:"delete",order:this.order});
 }

  IsComplexMenu(menu){
    if(menu.type && menu.type=="complex")
        return true;
    return false;    
  }

 getPaymentBackground(paymentString){
    //console.log("getPaymentBackground");
    if(paymentString=="현금-완납")
        return {"color":'#ff0000'};
    else 
        return {};     
 }

}
