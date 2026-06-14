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
  readonly canViewCategories = this.authState.hasPermission('CATEGORY_LIST_BY_STATUS');
  readonly canViewTags = this.authState.hasPermission('TAG_LIST_BY_STATUS');

  ngOnInit(): void {
    const url = this.router.url;

    if (url.includes('dishes')) {
      this.currentModule = 'dishes';
    } else if (url.includes('categories')) {
      this.currentModule = 'categories';
    } else if (url.includes('tags')) {
      this.currentModule = 'tags';
    } else {
      this.currentModule = 'products';
    }

    // Validar si el usuario tiene permiso para el módulo actual en la URL
    const hasCurrentPermission = 
      (this.currentModule === 'products' && this.canViewProducts) ||
      (this.currentModule === 'dishes' && this.canViewDishes) ||
      (this.currentModule === 'categories' && this.canViewCategories) ||
      (this.currentModule === 'tags' && this.canViewTags);

    // Si no tiene permiso, buscar el primer módulo disponible en cascada
    if (!hasCurrentPermission) {
      if (this.canViewProducts) {
        this.router.navigate(['/inventory', 'products']);
        this.currentModule = 'products';
      } else if (this.canViewDishes) {
        this.router.navigate(['/inventory', 'dishes']);
        this.currentModule = 'dishes';
      } else if (this.canViewCategories) {
        this.router.navigate(['/inventory', 'categories']);
        this.currentModule = 'categories';
      } else if (this.canViewTags) {
        this.router.navigate(['/inventory', 'tags']);
        this.currentModule = 'tags';
      } else {
        this.router.navigate(['/dashboard']);
      }
    }
  }

  changeModule(event: Event): void {
    const value = (event.target as HTMLSelectElement).value;
    this.currentModule = value;
    this.router.navigate(['/inventory', value]);
  }
}