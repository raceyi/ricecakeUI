import { NgModule } from '@angular/core';
import { IonicPageModule } from 'ionic-angular';
import { OrderInputPage } from './order-input';

@NgModule({
  declarations: [
    OrderInputPage,
  ],
  imports: [
    IonicPageModule.forChild(OrderInputPage),
  ],
})
export class OrderInputPageModule {}
