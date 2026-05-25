import { Component, inject } from '@angular/core';
import { RouterLink } from '@angular/router';
import { AuthStateService } from '@core/auth/services/auth-state.service';
import { ProductListFragmentComponent } from '@features/products/fragments/product-list-fragment/product-list-fragment.component';
import { ProductCreateFragmentComponent } from '@features/products/fragments/product-create-fragment/product-create-fragment.component';

@Component({
  selector: 'app-product-principal',
  standalone: true,
  imports: [RouterLink, ProductListFragmentComponent, ProductCreateFragmentComponent],
  templateUrl: './product_principal.html',
  styleUrl: './product_principal.scss',
})
export class ProductPrincipal {
  readonly authState = inject(AuthStateService);

  readonly canList = this.authState.hasPermission('PRODUCT_LIST_BY_STATUS');
  readonly canCreate = this.authState.hasPermission('PRODUCT_CREATE');
}