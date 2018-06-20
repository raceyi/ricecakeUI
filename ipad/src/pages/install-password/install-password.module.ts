import { NgModule } from '@angular/core';
import { IonicPageModule } from 'ionic-angular';
import { InstallPasswordPage } from './install-password';

@NgModule({
  declarations: [
    InstallPasswordPage,
  ],
  imports: [
    IonicPageModule.forChild(InstallPasswordPage),
  ],
})
export class InstallPasswordPageModule {}
