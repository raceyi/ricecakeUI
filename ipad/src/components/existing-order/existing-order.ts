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

  modifyOrder(order) {
      this.output.emit({operation:"modify",order:this.order});
  };

 deleteOrder(){
      this.output.emit({operation:"delete",order:this.order});
 }
}
