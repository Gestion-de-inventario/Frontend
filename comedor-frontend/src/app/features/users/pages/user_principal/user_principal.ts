import { Component, inject } from '@angular/core';

import { RouterLink } from '@angular/router';

import { AuthStateService } from '@core/auth/services/auth-state.service';

import { UserListFragmentComponent } from '@features/users/fragments/user-list-fragment/user-list-fragment.component';

import { UserCreateFragmentComponent } from '@features/users/fragments/user-create-fragment/user-create-fragment.component';

@Component({
  selector: 'app-user-principal',

  standalone: true,

  imports: [RouterLink, UserListFragmentComponent, UserCreateFragmentComponent],

  templateUrl: './user_principal.html',

  styleUrl: './user_principal.scss',
})
export class UserPrincipal {
  readonly authState = inject(AuthStateService);

  readonly canList = this.authState.hasPermission('USER_LIST_ALL');

  readonly canCreate = this.authState.hasPermission('USER_CREATE');
}
