import { NgModule } from '@angular/core';
import { IonicPageModule } from 'ionic-angular';
import { Page4Page } from './page4';
import { Page5PageModule } from '../page5/page5.module';
import { MyApp } from '../../app/app.component';

@NgModule({
  declarations: [
    Page4Page
  ],
  imports: [
    IonicPageModule.forChild(Page4Page),
    Page5PageModule
  ],
  entryComponents: [
    MyApp
  ]
})
export class Page4PageModule {}
