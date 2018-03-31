import { BrowserModule } from '@angular/platform-browser';
import { ErrorHandler, NgModule } from '@angular/core';
import { IonicApp, IonicErrorHandler, IonicModule } from 'ionic-angular';
import { SplashScreen } from '@ionic-native/splash-screen';
import { StatusBar } from '@ionic-native/status-bar';

import { MyApp } from './app.component';
import { HomePage } from '../pages/home/home';
import { StorageProvider } from '../providers/storage/storage';
import { ServerProvider } from '../providers/server/server';
import { ConfigProvider } from '../providers/config/config';

import {ComponentsModule} from '../components/components.module';
import { HttpClientModule } from '@angular/common/http';
import {CarrierManagementPageModule} from '../pages/carrier-management/carrier-management.module';
import {ManagerEntrancePageModule} from '../pages/manager-entrance/manager-entrance.module';
import {TrashPageModule} from '../pages/trash/trash.module';
import {ManagerPageModule} from '../pages/manager/manager.module';
import { CalendarModule } from 'ionic3-calendar-en';
//import { InAppBrowser } from '@ionic-native/in-app-browser'

@NgModule({
  declarations: [
    MyApp,
    HomePage
  ],
  imports: [
    CalendarModule,
    ManagerPageModule,
    ManagerEntrancePageModule,
    TrashPageModule,
    CarrierManagementPageModule,
    HttpClientModule,
    ComponentsModule,
    BrowserModule,
    IonicModule.forRoot(MyApp)
  ],
  bootstrap: [IonicApp],
  entryComponents: [
    MyApp,
    HomePage
  ],
  providers: [
    //InAppBrowser,
    StatusBar,
    SplashScreen,
    {provide: ErrorHandler, useClass: IonicErrorHandler},
    StorageProvider,
    ServerProvider,
    ConfigProvider
  ]
})
export class AppModule {}
