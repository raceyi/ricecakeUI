import { NgModule } from '@angular/core';
import { IonicPageModule } from 'ionic-angular';
import { ManagerPage } from './manager';
import { CalendarModule } from 'ionic3-calendar-en';
import {ComponentsModule} from '../../components/components.module';

@NgModule({
  declarations: [
    ManagerPage,
  ],
  imports: [
    ComponentsModule,
    CalendarModule,
    IonicPageModule.forChild(ManagerPage),
  ],
})
export class ManagerPageModule {}
