import { BrowserModule } from '@angular/platform-browser';
import { ErrorHandler, NgModule } from '@angular/core';
import { IonicApp, IonicErrorHandler, IonicModule } from 'ionic-angular';
import { SplashScreen } from '@ionic-native/splash-screen';
import { StatusBar } from '@ionic-native/status-bar';

import { MyApp } from './app.component';
import { HomePage } from '../pages/home/home';

import {DuckMainPageModule} from '../pages/duck-main/duck-main.module';
import {ProductionPageModule} from '../pages/production/production.module';
import {AdministratorPageModule} from '../pages/administrator/administrator.module';
import {MaechulPageModule} from '../pages/maechul/maechul.module';
import {GarbagePageModule} from '../pages/garbage/garbage.module';

@NgModule({
  declarations: [
    MyApp,
    HomePage
  ],
  imports: [
    BrowserModule,
    DuckMainPageModule,
    ProductionPageModule,
    AdministratorPageModule,
    MaechulPageModule,
    
    IonicModule.forRoot(MyApp,{
      menuType: 'push', 
      platforms: {
        ios: {
          menuType: 'overlay'
        }
      }
    }),
     GarbagePageModule
  ],
  bootstrap: [IonicApp],
  entryComponents: [
    MyApp,
    HomePage
  ],
  providers: [
    StatusBar,
    SplashScreen,
    {provide: ErrorHandler, useClass: IonicErrorHandler}
  ]
})
export class AppModule {}
