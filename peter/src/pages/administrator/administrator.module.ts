import { NgModule } from '@angular/core';
import { IonicPageModule } from 'ionic-angular';
import { AdministratorPage } from './administrator';

@NgModule({
  declarations: [
    AdministratorPage,
  ],
  imports: [
    IonicPageModule.forChild(AdministratorPage),
  ],
})

export class AdministratorPageModule {}
