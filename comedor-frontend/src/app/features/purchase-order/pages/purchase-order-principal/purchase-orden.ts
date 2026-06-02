import { Component, inject } from '@angular/core';
import { AuthStateService } from '@core/auth/services/auth-state.service';
import { PurchaseOrderCreateFragmentComponent } from '@features/purchase-order/fragments/create-purchase-fragment/create-purchase-fragment.component';

@Component({
  selector: 'app-purchase-orden',
  imports: [PurchaseOrderCreateFragmentComponent],
  templateUrl: './purchase-orden.html',
  styleUrl: './purchase-orden.scss',
})
export class PurchaseOrden {
  readonly authState = inject(AuthStateService);
  canCreatePurchase = this.authState.hasPermission('PURCHASE_CREATE');
}
