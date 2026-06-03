import { Component, computed, inject, signal } from '@angular/core';

import { CommonModule } from '@angular/common';

import { FormsModule } from '@angular/forms';

import { RoleService } from '@features/roles_permissions/services/role-api.service';

import { RoleStateService } from '@features/roles_permissions/services/role-state.service';

import { RoleResponse } from '@features/roles_permissions/interfaces/role.response';

import { RoleDetailModalComponent } from '@features/roles_permissions/modals/role-detail-modal/role-detail-modal.component';

declare const bootstrap: any;

@Component({
  selector: 'app-role-list-fragment',

  standalone: true,

  imports: [CommonModule, FormsModule, RoleDetailModalComponent],

  templateUrl: './role-list-fragment.component.html',

  styleUrls: ['./role-list-fragment.component.scss'],
})
export class RoleListFragmentComponent {
  private readonly roleService = inject(RoleService);

  readonly roleState = inject(RoleStateService);

  readonly roles = computed(() => this.roleState.filteredRoles());

  loading = signal(false);

  constructor() {
    this.loadRoles();
  }

  loadRoles(): void {
    this.loading.set(true);

    this.roleService.listRolesByStatus('ACTIVO').subscribe({
      next: (roles) => {
        this.roleState.setRoles(roles);
      },

      complete: () => {
        this.loading.set(false);
      },
    });
  }

  onSearch(event: Event): void {
    const value = (event.target as HTMLInputElement).value;

    this.roleState.setSearch(value);
  }

  onStatusChange(event: Event): void {
    const value = (event.target as HTMLSelectElement).value;

    this.roleState.setStatusFilter(value);
  }

  openRole(role: RoleResponse): void {
    this.roleState.setSelectedRole(role);

    const modal = new bootstrap.Modal(document.getElementById('roleDetailModal'));

    modal.show();
  }
}
