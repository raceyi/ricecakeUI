import { BrowserModule } from '@angular/platform-browser';
import { ErrorHandler, NgModule } from '@angular/core';
import { IonicApp, IonicErrorHandler, IonicModule } from 'ionic-angular';
import { SplashScreen } from '@ionic-native/splash-screen';
import { StatusBar } from '@ionic-native/status-bar';

import { MyApp } from './app.component';
import { HomePage } from '../pages/home/home';
import {Page2PageModule} from '../pages/page2/page2.module';
import {Page3PageModule} from '../pages/page3/page3.module';
import { Printer, PrintOptions } from '@ionic-native/printer'
import { InAppBrowser } from '@ionic-native/in-app-browser'
import { HttpClientModule } from '@angular/common/http';

@NgModule({
  declarations: [
    MyApp,
    HomePage
  ],
  imports: [
    HttpClientModule,
    BrowserModule,
    Page2PageModule,
    Page3PageModule,
    IonicModule.forRoot(MyApp, {
      menuType: 'push',
      platform: {
        ios: {
          menuType: 'overlay'
        }
      }
    }),
   Page2PageModule,
   Page3PageModule
  ],
  bootstrap: [IonicApp],
  entryComponents: [
    MyApp,
    HomePage
  ],
  providers: [
    InAppBrowser,
    Printer,
    StatusBar,
    SplashScreen,
    {provide: ErrorHandler, useClass: IonicErrorHandler}
  ]
})
export class AppModule {}
