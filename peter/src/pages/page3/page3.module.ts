import { NgModule } from '@angular/core';
import { IonicPageModule } from 'ionic-angular';
import { Page3Page } from './page3';
import { Page4PageModule } from '../page4/page4.module';
import { MyApp } from '../../app/app.component';

@NgModule({
  declarations: [
    Page3Page
  ],
  imports: [
    IonicPageModule.forChild(Page3Page),
    Page4PageModule
  ],
  entryComponents: [
    MyApp
  ]
})
export class Page3PageModule {}
