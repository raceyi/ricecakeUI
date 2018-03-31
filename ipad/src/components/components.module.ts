import { NgModule } from '@angular/core';
import { AmountDisplayComponent } from './amount-display/amount-display';
import {IonicModule} from 'ionic-angular';
import { OrderComponent } from './order/order';
import { CarrierOrderComponent } from './carrier-order/carrier-order';
import { UnassignedCarrierOrderComponent } from './unassigned-carrier-order/unassigned-carrier-order';

@NgModule({
	declarations: [AmountDisplayComponent,
    OrderComponent,
    CarrierOrderComponent,
    UnassignedCarrierOrderComponent],
	imports: [IonicModule],
	exports: [AmountDisplayComponent,
    OrderComponent,
    CarrierOrderComponent,
    UnassignedCarrierOrderComponent]
})
export class ComponentsModule {}
