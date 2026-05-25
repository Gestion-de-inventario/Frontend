import { Component, inject } from '@angular/core';

import { RouterLink } from '@angular/router';

import { AuthStateService } from '@core/auth/services/auth-state.service';

import { RoleCreateFragmentComponent } from '@features/roles_permissions/fragments/role-create-fragment/role-create-fragment.component';

import { RoleListFragmentComponent } from '@features/roles_permissions/fragments/role-list-fragment/role-list-fragment.component';

@Component({
  selector: 'app-roles-permissions-principal',

  standalone: true,

  imports: [RouterLink, RoleCreateFragmentComponent, RoleListFragmentComponent],

  templateUrl: './roles-permissions_principal.html',

  styleUrls: ['./roles-permissions_principal.scss'],
})
export class RolesPermissionsPrincipalComponent {
  readonly authState = inject(AuthStateService);

  readonly canList = this.authState.hasPermission('ROLE_LIST_BY_STATUS');

  readonly canCreate = this.authState.hasPermission('ROLE_CREATE');

  readonly canAssignPermissions = this.authState.hasPermission('ROLE_ADD_PERMISSION');
}
