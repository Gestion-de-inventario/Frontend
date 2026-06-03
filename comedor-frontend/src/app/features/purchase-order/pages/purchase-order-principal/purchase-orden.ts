import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { AuthStateService } from '@core/auth/services/auth-state.service';
import { inject } from '@angular/core';
@Component({
  selector: 'app-purchase-orden',
  standalone: true,
  imports: [RouterOutlet],
  templateUrl: './purchase-orden.html',
})
export class PurchaseOrden {
  readonly authState = inject(AuthStateService);

  canAccess =
    this.authState.hasPermission('PURCHASE_LIST_ALL') ||
    this.authState.hasPermission('PURCHASE_CREATE');
}
