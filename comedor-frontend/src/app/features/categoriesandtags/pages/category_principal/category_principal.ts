import { Component, inject } from '@angular/core';
import { RouterLink } from '@angular/router';
import { AuthStateService } from '@core/auth/services/auth-state.service';
import { CategoryListFragmentComponent } from '@features/categoriesandtags/fragments/category-list-fragment/category-list-fragment.component';
import { CategoryCreateFragmentComponent } from '@features/categoriesandtags/fragments/category-create-fragment/category-create-fragment.component';

@Component({
  selector: 'app-category-principal',
  standalone: true,
  imports: [
    RouterLink,
    CategoryListFragmentComponent,
    CategoryCreateFragmentComponent,
  ],
  templateUrl: './category_principal.html',
  styleUrl: './category_principal.scss',
})
export class CategoryPrincipal {
  readonly authState = inject(AuthStateService);

  readonly canListCategory = this.authState.hasPermission('CATEGORY_LIST_BY_STATUS');
  readonly canCreateCategory = this.authState.hasPermission('CATEGORY_CREATE');
}