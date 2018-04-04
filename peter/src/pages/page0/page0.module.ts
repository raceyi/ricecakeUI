import { NgModule } from '@angular/core';
import { IonicPageModule } from 'ionic-angular';
import { Page0Page } from './page0';
import { MyApp } from '../../app/app.component';

@NgModule({
  declarations: [
    Page0Page
  ],
  imports: [
    IonicPageModule.forChild(Page0Page)
  ]
})
export class Page0PageModule {}
