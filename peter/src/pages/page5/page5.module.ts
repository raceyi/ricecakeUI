import { NgModule } from '@angular/core';
import { IonicPageModule } from 'ionic-angular';
import { Page5Page } from './page5';
import { MyApp } from '../../app/app.component';

@NgModule({
  declarations: [
    Page5Page,
  ],
  imports: [
    IonicPageModule.forChild(Page5Page),
  ],
  entryComponents: [
    MyApp
  ]
})
export class Page5PageModule {}
