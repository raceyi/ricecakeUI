import { NgModule } from '@angular/core';
import { IonicPageModule } from 'ionic-angular';
import { ManagerPage } from './manager';
import { CalendarModule } from 'ionic3-calendar-en';
import {ComponentsModule} from '../../components/components.module';
import { DragulaModule } from 'ng2-dragula/ng2-dragula';

@NgModule({
  declarations: [
    ManagerPage,
  ],
  imports: [
    DragulaModule,
    ComponentsModule,
    CalendarModule,
    IonicPageModule.forChild(ManagerPage),
  ],
})
export class ManagerPageModule {}
