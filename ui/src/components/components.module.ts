import { NgModule } from '@angular/core';
import { AmountDisplayComponent } from './amount-display/amount-display';
import {IonicModule} from 'ionic-angular';
import { OrderComponent } from './order/order';
import { CarrierOrderComponent } from './carrier-order/carrier-order';

@NgModule({
	declarations: [AmountDisplayComponent,
    OrderComponent,
    CarrierOrderComponent],
	imports: [IonicModule],
	exports: [AmountDisplayComponent,
    OrderComponent,
    CarrierOrderComponent]
})
export class ComponentsModule {}
