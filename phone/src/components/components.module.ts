import { NgModule } from '@angular/core';
import {IonicModule} from 'ionic-angular';
import { PhoneExistingOrderComponent } from './phone-existing-order/phone-existing-order';
import { PhoneCarrierOrderComponent } from './phone-carrier-order/phone-carrier-order';
import { PhoneTrashOrderComponent } from './phone-trash-order/phone-trash-order';
import { PhoneUnassignedCarrierOrderComponent } from './phone-unassigned-carrier-order/phone-unassigned-carrier-order';

import { AmountDisplayComponent } from './amount-display/amount-display';
import { OrderComponent } from './order/order';
import { CarrierOrderComponent } from './carrier-order/carrier-order';
import { UnassignedCarrierOrderComponent } from './unassigned-carrier-order/unassigned-carrier-order';
import { ExistingOrderComponent } from './existing-order/existing-order';
import { TrashOrderComponent } from './trash-order/trash-order';

@NgModule({
	declarations: [PhoneExistingOrderComponent,
    PhoneCarrierOrderComponent,
    PhoneTrashOrderComponent,
    PhoneUnassignedCarrierOrderComponent,
    AmountDisplayComponent,
    OrderComponent,
    CarrierOrderComponent,
    UnassignedCarrierOrderComponent,
    ExistingOrderComponent,
    TrashOrderComponent],
	imports: [IonicModule],
	exports: [PhoneExistingOrderComponent,
    PhoneCarrierOrderComponent,
    PhoneTrashOrderComponent,
    PhoneUnassignedCarrierOrderComponent,
    AmountDisplayComponent,
    OrderComponent,
    CarrierOrderComponent,
    UnassignedCarrierOrderComponent,
    ExistingOrderComponent,
    TrashOrderComponent]
})
export class ComponentsModule {}
