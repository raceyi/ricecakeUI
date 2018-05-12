import { NgModule } from '@angular/core';
import { IonicPageModule } from 'ionic-angular';
import { DeliveryPage } from './delivery';
import {ComponentsModule} from '../../components/components.module';

@NgModule({
  declarations: [
    DeliveryPage,
  ],
  imports: [
    ComponentsModule,
    IonicPageModule.forChild(DeliveryPage),
  ],
})
export class DeliveryPageModule {}
