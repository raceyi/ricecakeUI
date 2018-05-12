import { Component } from '@angular/core';

import { DeliveryPage } from '../delivery/delivery';
import { OrderPage } from '../order/order';
import { ProducePage } from '../produce/produce';
import { SetPage } from '../set/set';

@Component({
  templateUrl: 'tabs.html'
})
export class TabsPage {

  tab1Root = OrderPage;
  tab2Root = DeliveryPage;
  tab3Root = ProducePage;
  tab4Root = SetPage;
  
  constructor() {

  }
}
