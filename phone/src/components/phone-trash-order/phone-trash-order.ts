import { Component } from '@angular/core';

/**
 * Generated class for the PhoneTrashOrderComponent component.
 *
 * See https://angular.io/api/core/Component for more info on Angular
 * Components.
 */
@Component({
  selector: 'phone-trash-order',
  templateUrl: 'phone-trash-order.html'
})
export class PhoneTrashOrderComponent {

  text: string;

  constructor() {
    console.log('Hello PhoneTrashOrderComponent Component');
    this.text = 'Hello World';
  }

}
