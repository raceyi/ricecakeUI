import { Component } from '@angular/core';
import { Platform } from 'ionic-angular';
import { DeliveryPage } from '../delivery/delivery';
import { OrderPage } from '../order/order';
import { ProducePage } from '../produce/produce';
import { SetPage } from '../set/set';
import { ScreenOrientation } from '@ionic-native/screen-orientation';

@Component({
  templateUrl: 'tabs.html'
})
export class TabsPage {

  tab1Root = OrderPage;
  tab2Root = DeliveryPage;
  tab3Root = ProducePage;
  tab4Root = SetPage;
  
  constructor(private platform: Platform,private screenOrientation: ScreenOrientation) {
    platform.ready().then(() => {
      this.screenOrientation.lock(this.screenOrientation.ORIENTATIONS.PORTRAIT);
    });
  }
}
