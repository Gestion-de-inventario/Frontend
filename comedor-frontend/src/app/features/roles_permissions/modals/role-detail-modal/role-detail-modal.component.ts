import { Component, computed, inject, ChangeDetectorRef, signal } from '@angular/core';

import { FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';

import { CommonModule } from '@angular/common';

import { AuthStateService } from '@core/auth/services/auth-state.service';

import { RoleStateService } from '../../services/role-state.service';

import { RoleService } from '@features/roles_permissions/services/role-api.service';

import { ToastService } from '@shared/services/toast.service';

import { PermissionService } from '@features/roles_permissions/services/permissions-api.service';

import { PermissionResponse } from '@features/roles_permissions/interfaces/permission.response';

import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-role-detail-modal',

  standalone: true,

  imports: [CommonModule, ReactiveFormsModule, FormsModule],

  templateUrl: './role-detail-modal.component.html',

  styleUrls: ['./role-detail-modal.component.scss'],
})
export class RoleDetailModalComponent {
  private readonly cdr = inject(ChangeDetectorRef);

  readonly authState = inject(AuthStateService);

  private readonly roleState = inject(RoleStateService);

  private readonly roleService = inject(RoleService);

  private readonly toastService = inject(ToastService);

  private readonly permissionService = inject(PermissionService);

  readonly role = computed(() => this.roleState.selectedRole());

  mode: 'view' | 'edit' | 'permissions' = 'view';

  loading = signal<boolean>(false);

  permissions: PermissionResponse[] = [];

  selectedPermissions: string[] = [];

  permissionSearch = '';

  groupedPermissions: Record<string, PermissionResponse[]> = {};

  permissionGroups: {
    module: string;
    permissions: PermissionResponse[];
  }[] = [];

  readonly form = new FormGroup({
    name: new FormControl('', {
      nonNullable: true,
      validators: [Validators.required],
    }),
  });

  openEdit(): void {
    const role = this.role();

    if (!role) {
      return;
    }

    this.form.patchValue({
      name: role.name,
    });

    this.mode = 'edit';
  }

  openAssignPermissions(): void {
    const role = this.role();

    if (!role) {
      return;
    }

    this.mode = 'permissions';

    this.permissions = [];

    this.groupedPermissions = {};

    this.selectedPermissions = [...role.permissions];

    this.permissionSearch = '';

    this.loading.apply(true);

    this.permissionService.getAllPermissions().subscribe({
      next: (permissions) => {
        this.permissions = permissions;

        const grouped = permissions.reduce(
          (acc, permission) => {
            const module = permission.module || 'Sin Módulo';
            if (!acc[module]) acc[module] = [];
            acc[module].push(permission);
            return acc;
          },
          {} as Record<string, PermissionResponse[]>,
        );

        this.permissionGroups = Object.entries(grouped).map(([module, permissions]) => ({
          module,
          permissions,
        }));

        this.loading.apply(false);
      },
      error: (error) => {
        this.toastService.show(error.error?.message || 'Error al cargar permisos', 'danger');
        this.loading.apply(false);
        this.mode = 'view';
      },
    });
  }

  togglePermission(code: string): void {
    if (this.selectedPermissions.includes(code)) {
      this.selectedPermissions = this.selectedPermissions.filter((p) => p !== code);

      return;
    }

    this.selectedPermissions = [...this.selectedPermissions, code];
  }

  toggleModule(modulePermissions: PermissionResponse[], checked: boolean): void {
    const codes = modulePermissions.map((p) => p.code);

    if (checked) {
      this.selectedPermissions = [...new Set([...this.selectedPermissions, ...codes])];

      return;
    }

    this.selectedPermissions = this.selectedPermissions.filter((p) => !codes.includes(p));
  }

  isModuleSelected(modulePermissions: PermissionResponse[]): boolean {
    return modulePermissions.every((permission) =>
      this.selectedPermissions.includes(permission.code),
    );
  }

  changeStatus(status: 'ACTIVAR' | 'DESACTIVAR'): void {
    const role = this.role();

    if (!role || this.loading()) {
      return;
    }

    this.loading.apply(true);

    this.roleService.changeStatus(role.role_id, status).subscribe({
      next: (updated) => {
        this.roleState.updateRole(updated);

        this.toastService.show(
          status === 'ACTIVAR' ? 'Rol activado' : 'Rol desactivado',
          status === 'ACTIVAR' ? 'success' : 'warning',
        );
      },

      error: (error) => {
        this.toastService.show('No se pudo cambiar el estado: ' + error.error.message, 'danger');
        this.loading.apply(false);
      },

      complete: () => {
        this.loading.apply(false);
      },
    });
  }

  savePermissions(): void {
    const role = this.role();

    if (!role || this.loading()) {
      return;
    }

    this.loading.apply(true);

    this.roleService
      .assignPermissions(role.role_id, {
        permissions: this.selectedPermissions,
      } as any)
      .subscribe({
        next: (updatedRole) => {
          this.roleState.updateRole(updatedRole);
          this.toastService.show('Permisos actualizados', 'success');
          this.mode = 'view';
          this.loading.apply(false);
        },

        error: (error) => {
          this.toastService.show(error.error.message, 'danger');
          this.loading.apply(false);
        },

        complete: () => {
          this.loading.apply(false);
        },
      });
  }

  goBack(): void {
    this.mode = 'view';
  }

  save(): void {
    const role = this.role();

    if (!role || this.form.invalid || this.loading()) {
      return;
    }

    this.loading.apply(true);

    this.roleService.editRole(role.role_id, this.form.getRawValue()).subscribe({
      next: (updatedRole) => {
        this.roleState.updateRole(updatedRole);

        this.toastService.show('Rol actualizado', 'success');

        this.mode = 'view';
      },

      error: (error) => {
        this.toastService.show(error.error.message, 'danger');
        this.loading.apply(false);
      },

      complete: () => {
        this.loading.apply(false);
      },
    });
  }

  close(): void {
    this.mode = 'view';

    this.roleState.clearSelectedRole();
  }
}
