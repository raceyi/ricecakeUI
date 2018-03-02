import { BrowserModule } from '@angular/platform-browser';
import { ErrorHandler, NgModule } from '@angular/core';
import { IonicApp, IonicErrorHandler, IonicModule } from 'ionic-angular';

import { SplashScreen } from '@ionic-native/splash-screen';
import { StatusBar } from '@ionic-native/status-bar';

import { MyApp } from './app.component';

import {DuckMainPageModule} from '../pages/duck-main/duck-main.module';
import {AdministratorPageModule} from '../pages/administrator/administrator.module';
import {GarbagePageModule} from '../pages/garbage/garbage.module';
import {BaedalPageModule} from '../pages/baedal/baedal.module';

import { AppDataProvider } from '../providers/app-data/app-data';

@NgModule({
  declarations: [
    MyApp
  ],
  imports: [
    BrowserModule,
    DuckMainPageModule,
    AdministratorPageModule,

    IonicModule.forRoot(MyApp, {mode: 'ios'}),
    
    GarbagePageModule,
    BaedalPageModule
  ],
  bootstrap: [IonicApp],
  entryComponents: [
    MyApp
  ],
  providers: [
    StatusBar,
    SplashScreen,
    {provide: ErrorHandler, useClass: IonicErrorHandler},
    AppDataProvider
  ]
})
export class AppModule {}
