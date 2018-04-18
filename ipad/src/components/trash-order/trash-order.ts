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
 @Input('order') orderIn:any;
 @Output("output") output= new EventEmitter();

  order;
  
  constructor() {
    console.log('Hello TrashOrderComponent Component');
  }

  ngOnInit() { 
    this.order = Object.assign({}, this.orderIn); // copy object. Very important!!!! 아주 중요하다. 입력값은 사용하지 않는다.
  }

  IsComplexMenu(menu){
    if(menu.type && menu.type=="complex")
        return true;
    return false;    
  }

  recovery(){
        this.output.emit(this.order);
  }
}
