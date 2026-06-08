import { Component, inject, OnInit } from '@angular/core';
import { Router, RouterModule } from '@angular/router';
import { AuthStateService } from '@core/auth/services/auth-state.service';

@Component({
  selector: 'app-inventory-principal',
  standalone: true,
  imports: [RouterModule],
  templateUrl: './inventory-principal.component.html',
})
export class InventoryPrincipalComponent implements OnInit {
  private readonly router = inject(Router);
  readonly authState = inject(AuthStateService);

  currentModule = 'products';

  readonly canViewProducts = this.authState.hasPermission('PRODUCT_LIST_BY_STATUS');
  readonly canViewDishes = this.authState.hasPermission('DISH_MENU_LIST_ALL');

  ngOnInit(): void {
    const url = this.router.url;

    if (url.includes('dishes')) {
      this.currentModule = 'dishes';
    } else {
      this.currentModule = 'products';
    }

    // Redirigir al primer módulo disponible
    if (!this.canViewProducts && this.canViewDishes) {
      this.router.navigate(['/inventory', 'dishes']);
      this.currentModule = 'dishes';
    } else if (!this.canViewProducts && !this.canViewDishes) {
      this.router.navigate(['/dashboard']);
    }
  }

  changeModule(event: Event): void {
    const value = (event.target as HTMLSelectElement).value;
    this.currentModule = value;
    this.router.navigate(['/inventory', value]);
  }
}