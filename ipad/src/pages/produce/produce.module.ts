import { NgModule } from '@angular/core';
import { IonicPageModule } from 'ionic-angular';
import { ProducePage } from './produce';

@NgModule({
  declarations: [
    ProducePage,
  ],
  imports: [
    IonicPageModule.forChild(ProducePage),
  ],
})
export class ProducePageModule {}
