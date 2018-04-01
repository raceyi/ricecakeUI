import { BrowserModule } from '@angular/platform-browser';
import { ErrorHandler, NgModule } from '@angular/core';
import { IonicApp, IonicErrorHandler, IonicModule } from 'ionic-angular';
import { SplashScreen } from '@ionic-native/splash-screen';
import { StatusBar } from '@ionic-native/status-bar';

import { MyApp } from './app.component';
import { HomePage } from '../pages/home/home';
import { StorageProvider } from '../providers/storage/storage';
import { ServerProvider } from '../providers/server/server';
import { ConfigProvider}  from '../providers/config/config';
import {ComponentsModule} from '../components/components.module';

import { InAppBrowser } from '@ionic-native/in-app-browser'
import { HttpClientModule } from '@angular/common/http';
import {HTTP} from '@ionic-native/http'
import {Push,PushObject,PushOptions} from '@ionic-native/push';
import { BackgroundMode } from '@ionic-native/background-mode';

import {MyErrorHandler} from '../classes/my-error-handler';

@NgModule({
  declarations: [
    MyApp,
    HomePage
  ],
  imports: [
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
    BackgroundMode,
    Push,
    HTTP,    
    InAppBrowser,
    StatusBar,
    SplashScreen,
    {provide: ErrorHandler, useClass: MyErrorHandler},
    StorageProvider,
    ServerProvider,
    ConfigProvider
  ]
})
export class AppModule {}
