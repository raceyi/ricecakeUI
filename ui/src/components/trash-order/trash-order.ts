import { Component,Input,Output,EventEmitter } from '@angular/core';

/**
 * Generated class for the TrashOrderComponent component.
 *
 * See https://angular.io/api/core/Component for more info on Angular
 * Components.
 */
@Component({
  selector: 'trash-order',
  templateUrl: 'trash-order.html'
})
export class TrashOrderComponent {
 @Input('order') order:any;
 @Output("output") output= new EventEmitter();

  constructor() {
    console.log('Hello TrashOrderComponent Component');
  }

  recovery(){
        this.output.emit(this.order);
  }
}
