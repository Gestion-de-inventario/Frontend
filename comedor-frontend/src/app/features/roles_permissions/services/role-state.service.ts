import { Injectable, signal, computed } from '@angular/core';

import { RoleResponse } from '../interfaces/role.response';

@Injectable({
  providedIn: 'root',
})
export class RoleStateService {
  private readonly _roles = signal<RoleResponse[]>([]);

  private readonly _selectedRole = signal<RoleResponse | null>(null);

  private readonly _search = signal('');

  private readonly _statusFilter = signal('TODOS');

  readonly roles = this._roles.asReadonly();

  readonly selectedRole = this._selectedRole.asReadonly();

  readonly search = this._search.asReadonly();

  readonly statusFilter = this._statusFilter.asReadonly();

  readonly filteredRoles = computed(() => {
    const roles = this._roles();

    const search = this._search().toLowerCase();

    const status = this._statusFilter();

    return roles.filter((role) => {
      const matchesSearch = role.name.toLowerCase().includes(search);

      const matchesStatus = status === 'TODOS' ? true : role.status === status;

      return matchesSearch && matchesStatus;
    });
  });

  setRoles(roles: RoleResponse[]): void {
    this._roles.set(roles);
  }

  setSelectedRole(role: RoleResponse): void {
    this._selectedRole.set(role);
  }

  clearSelectedRole(): void {
    this._selectedRole.set(null);
  }

  setSearch(search: string): void {
    this._search.set(search);
  }

  setStatusFilter(status: string): void {
    this._statusFilter.set(status);
  }

  addRole(role: RoleResponse): void {
    this._roles.update((roles) => [role, ...roles]);
  }

  updateRole(updatedRole: RoleResponse): void {
    this._roles.update((roles) =>
      roles.map((role) => (role.role_id === updatedRole.role_id ? updatedRole : role)),
    );

    const selectedRole = this._selectedRole();

    if (selectedRole && selectedRole.role_id === updatedRole.role_id) {
      this._selectedRole.set(updatedRole);
    }
  }
}
