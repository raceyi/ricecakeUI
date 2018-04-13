import { NgModule } from '@angular/core';
import { IonicPageModule } from 'ionic-angular';
import { Page2Page } from './page2';
import { Page3PageModule} from '../page3/page3.module';
import { MyApp } from '../../app/app.component';
@NgModule({
  declarations: [
    Page2Page
  ],
  imports: [
    IonicPageModule.forChild(Page2Page),
    Page3PageModule
  ],
  entryComponents: [
    MyApp
  ]
})
export class Page2PageModule {}
