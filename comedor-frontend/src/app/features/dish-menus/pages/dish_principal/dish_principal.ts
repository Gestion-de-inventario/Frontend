import { Component, inject } from '@angular/core';
import { RouterLink } from '@angular/router';
import { AuthStateService } from '@core/auth/services/auth-state.service';
import { DishListFragmentComponent } from '@features/dish-menus/fragments/dish-list-fragment/dish-list-fragment.component';
import { DishCreateFragmentComponent } from '@features/dish-menus/fragments/dish-create-fragment/dish-create-fragment.component';

@Component({
  selector: 'app-dish-principal',
  standalone: true,
  imports: [RouterLink, DishListFragmentComponent, DishCreateFragmentComponent],
  templateUrl: './dish_principal.html',
  styleUrl: './dish_principal.scss',
})
export class DishPrincipal {
  readonly authState = inject(AuthStateService);
  readonly canList = this.authState.hasPermission('DISH_MENU_LIST_ALL');
  readonly canCreate = this.authState.hasPermission('DISH_MENU_CREATE');
}