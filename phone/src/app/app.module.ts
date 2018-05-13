import { NgModule, ErrorHandler } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { IonicApp, IonicModule, IonicErrorHandler } from 'ionic-angular';
import { MyApp } from './app.component';

import { TabsPage } from '../pages/tabs/tabs';
import {DeliveryPageModule} from '../pages/delivery/delivery.module';
import {OrderPageModule} from '../pages/order/order.module';
import {ProducePageModule} from '../pages/produce/produce.module';
import {SetPageModule} from '../pages/set/set.module';
import {OrderInputPageModule} from '../pages/order-input/order-input.module';

import { StatusBar } from '@ionic-native/status-bar';
import { SplashScreen } from '@ionic-native/splash-screen';
import { StorageProvider } from '../providers/storage/storage';

import { HttpClientModule } from '@angular/common/http';
import { ConfigProvider } from '../providers/config/config';
import { ServerProvider } from '../providers/server/server';

import { InAppBrowser } from '@ionic-native/in-app-browser'
import {HTTP} from '@ionic-native/http'
import {Push,PushObject,PushOptions} from '@ionic-native/push';
import { BackgroundMode } from '@ionic-native/background-mode';
import { Printer, PrintOptions } from '@ionic-native/printer';
import {CarrierManagementPageModule} from '../pages/carrier-management/carrier-management.module';
import {TrashPageModule} from '../pages/trash/trash.module';
import {TrashPasswordPageModule} from '../pages/trash-password/trash-password.module';

import { CalendarModule } from 'ionic3-calendar-en';
import { DragulaModule } from 'ng2-dragula/ng2-dragula';
import {ManagerPasswordPageModule} from '../pages/manager-password/manager-password.module';

import {ManagerPageModule} from '../pages/manager/manager.module';
import {ManagerEntrancePageModule} from '../pages/manager-entrance/manager-entrance.module';

import { MyErrorHandler } from '../classes/my-error-handler';
import { HttpWrapperProvider } from '../providers/http-wrapper/http-wrapper';
import {HomePageModule} from '../pages/home/home.module';
import { NativeStorage } from '@ionic-native/native-storage';
import {InstallPasswordPageModule} from '../pages/install-password/install-password.module';

@NgModule({
  declarations: [
    MyApp,
    TabsPage
  ],
  imports: [
    DragulaModule,
    CalendarModule, //just testing 
    HttpClientModule,
    BrowserModule,
    InstallPasswordPageModule,
    ManagerPageModule,
    ManagerEntrancePageModule,
    ManagerPasswordPageModule,    
    CarrierManagementPageModule,
    OrderInputPageModule,
    DeliveryPageModule,
    OrderPageModule,
    ProducePageModule,
    SetPageModule,
    TrashPageModule,
    TrashPasswordPageModule,
    HomePageModule,        
    IonicModule.forRoot(MyApp,{mode:'ios'})
  ],
  bootstrap: [IonicApp],
  entryComponents: [
    MyApp,
    TabsPage
  ],
  providers: [
    NativeStorage,
    Printer,
    BackgroundMode,
    Push,
    HTTP,    
    InAppBrowser,    
    StatusBar,
    SplashScreen,
    {provide: ErrorHandler, useClass: MyErrorHandler},
    StorageProvider,
    ConfigProvider,
    ServerProvider,
    HttpWrapperProvider
  ]
})
export class AppModule {}
