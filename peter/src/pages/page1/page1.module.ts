import { NgModule } from '@angular/core';
import { IonicPageModule } from 'ionic-angular';
import { Page1Page } from './page1';
import { Page2PageModule } from '../page2/page2.module';
import { MyApp } from '../../app/app.component';

@NgModule({
  declarations: [
    Page1Page
  ],
  imports: [
    IonicPageModule.forChild(Page1Page),
    Page2PageModule
  ],
  entryComponents: [
    MyApp
  ]
})
export class Page1PageModule {}
