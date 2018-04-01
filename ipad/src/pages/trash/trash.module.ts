import { NgModule } from '@angular/core';
import { IonicPageModule } from 'ionic-angular';
import { TrashPage } from './trash';
import {ComponentsModule} from '../../components/components.module';

@NgModule({
  declarations: [
    TrashPage,
  ],
  imports: [
    ComponentsModule,
    IonicPageModule.forChild(TrashPage),
  ],
})
export class TrashPageModule {}
