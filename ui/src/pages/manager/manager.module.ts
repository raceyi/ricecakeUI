import { NgModule } from '@angular/core';
import { IonicPageModule } from 'ionic-angular';
import { ManagerPage } from './manager';
import { CalendarModule } from 'ionic3-calendar-en';

@NgModule({
  declarations: [
    ManagerPage,
  ],
  imports: [
    CalendarModule,
    IonicPageModule.forChild(ManagerPage),
  ],
})
export class ManagerPageModule {}
