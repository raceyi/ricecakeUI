import { NgModule } from '@angular/core';

import { IonicPageModule } from 'ionic-angular';

import { DuckMainPage } from './duck-main';

@NgModule({
  declarations: [
    DuckMainPage,
  ],
  imports: [
    IonicPageModule.forChild(DuckMainPage),
  ],
})

export class DuckMainPageModule {}
