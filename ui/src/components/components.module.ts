import { NgModule } from '@angular/core';
import { AmountDisplayComponent } from './amount-display/amount-display';
import {IonicModule} from 'ionic-angular';
import { OrderComponent } from './order/order';

@NgModule({
	declarations: [AmountDisplayComponent,
    OrderComponent],
	imports: [IonicModule],
	exports: [AmountDisplayComponent,
    OrderComponent]
})
export class ComponentsModule {}
