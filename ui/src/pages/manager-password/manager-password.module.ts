import { NgModule } from '@angular/core';
import { IonicPageModule } from 'ionic-angular';
import { ManagerPasswordPage } from './manager-password';

@NgModule({
  declarations: [
    ManagerPasswordPage,
  ],
  imports: [
    IonicPageModule.forChild(ManagerPasswordPage),
  ],
})
export class ManagerPasswordPageModule {}
