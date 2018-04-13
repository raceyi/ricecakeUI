import { NgModule } from '@angular/core';
import { IonicPageModule } from 'ionic-angular';
import { CarrierManagementPage } from './carrier-management';

@NgModule({
  declarations: [
    CarrierManagementPage,
  ],
  imports: [
    IonicPageModule.forChild(CarrierManagementPage),
  ],
})
export class CarrierManagementPageModule {}
