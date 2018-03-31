import { NgModule } from '@angular/core';
import { IonicPageModule } from 'ionic-angular';
import { ManagerEntrancePage } from './manager-entrance';

@NgModule({
  declarations: [
    ManagerEntrancePage,
  ],
  imports: [
    IonicPageModule.forChild(ManagerEntrancePage),
  ],
})
export class ManagerEntrancePageModule {}
