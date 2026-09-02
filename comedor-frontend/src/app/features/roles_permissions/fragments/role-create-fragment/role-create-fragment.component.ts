import { Component, inject, signal } from '@angular/core';

import {
  FormControl,
  FormGroup,
  FormsModule,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';

import { CommonModule } from '@angular/common';

import { RoleService } from '@features/roles_permissions/services/role-api.service';

import { PermissionService } from '@features/roles_permissions/services/permissions-api.service';

import { RoleStateService } from '@features/roles_permissions/services/role-state.service';

import { ToastService } from '@shared/services/toast.service';

import { PermissionResponse } from '@features/roles_permissions/interfaces/permission.response';

import {
  PERMISSION_MODULE_LABELS,
  PERMISSION_LABELS,
  PERMISSION_TITLE_LABELS,
} from '@shared/constants/permission-labels';

declare const bootstrap: any;

@Component({
  selector: 'app-role-create-fragment',

  standalone: true,

  imports: [CommonModule, ReactiveFormsModule, FormsModule],

  templateUrl: './role-create-fragment.component.html',

  styleUrls: ['./role-create-fragment.component.scss'],
})
export class RoleCreateFragmentComponent {
  private readonly roleService = inject(RoleService);

  private readonly permissionService = inject(PermissionService);

  private readonly roleState = inject(RoleStateService);

  private readonly toastService = inject(ToastService);

  permissions: PermissionResponse[] = [];

  permissionGroups: {
    module: string;
    permissions: PermissionResponse[];
  }[] = [];

  permissionSearch = '';

  loading = signal<boolean>(false);

  permissionsLoading = signal<boolean>(false);

  readonly form = new FormGroup({
    name: new FormControl('', {
      nonNullable: true,
      validators: [Validators.required, Validators.pattern(/^[A-Za-zÁÉÍÓÚáéíóúÑñ0-9\s_ -]+$/)],
    }),

    permissions: new FormControl<string[]>([], {
      nonNullable: true,
    }),
  });

  constructor() {
    this.loadPermissions();
  }

  getModuleLabel(module: string): string {
    return PERMISSION_MODULE_LABELS[module] ?? module;
  }

  getPermissionActionLabel(permission: string): string {
    return PERMISSION_LABELS[permission] ?? permission;
  }

  getPermissionTitle(permission: string): string {
    return PERMISSION_TITLE_LABELS[permission] ?? permission;
  }

  loadPermissions(): void {
    this.permissionsLoading.set(true);

    this.permissionService.getAllPermissions().subscribe({
      next: (permissions) => {
        this.permissions = permissions.filter((permission) => !!permission.code);

        const grouped = this.permissions.reduce(
          (acc, permission) => {
            const module = permission.module || 'Sin módulo';

            if (!acc[module]) {
              acc[module] = [];
            }

            acc[module].push(permission);

            return acc;
          },
          {} as Record<string, PermissionResponse[]>,
        );

        this.permissionGroups = Object.entries(grouped).map(([module, permissions]) => ({
          module,
          permissions,
        }));
        this.permissionsLoading.set(false);
      },
      error: (error) => {
        this.toastService.show(
          error.error?.message || 'No se pudieron cargar los permisos',
          'danger',
        );
        this.permissionsLoading.set(false);
      },
      complete: () => {
        this.permissionsLoading.set(false);
      },
    });
  }

  openModal(): void {
    const modal = new bootstrap.Modal(document.getElementById('createRoleModal'));

    modal.show();
  }

  onPermissionChange(event: Event, permission: string): void {
    const checked = (event.target as HTMLInputElement).checked;

    const currentPermissions = this.form.controls.permissions.value;

    if (checked) {
      this.form.controls.permissions.setValue([...currentPermissions, permission]);

      return;
    }

    this.form.controls.permissions.setValue(currentPermissions.filter((p) => p !== permission));
  }

  togglePermission(permissionCode: string): void {
    const currentPermissions = this.form.controls.permissions.value;

    if (currentPermissions.includes(permissionCode)) {
      this.form.controls.permissions.setValue(
        currentPermissions.filter((permission) => permission !== permissionCode),
      );

      return;
    }

    this.form.controls.permissions.setValue([...new Set([...currentPermissions, permissionCode])]);
  }

  toggleModule(modulePermissions: PermissionResponse[], checked: boolean): void {
    const codes = modulePermissions.map((permission) => permission.code);

    const currentPermissions = this.form.controls.permissions.value;

    if (checked) {
      this.form.controls.permissions.setValue([...new Set([...currentPermissions, ...codes])]);

      return;
    }

    this.form.controls.permissions.setValue(
      currentPermissions.filter((permission) => !codes.includes(permission)),
    );
  }

  isModuleSelected(modulePermissions: PermissionResponse[]): boolean {
    const currentPermissions = this.form.controls.permissions.value;

    return modulePermissions.every((permission) => currentPermissions.includes(permission.code));
  }

  isPermissionSelected(permissionCode: string): boolean {
    return this.form.controls.permissions.value.includes(permissionCode);
  }

  matchesPermissionSearch(permission: PermissionResponse): boolean {
    const term = this.permissionSearch.trim().toLowerCase();

    if (!term) return true;

    const code = permission.code.toLowerCase();
    const module = this.getModuleLabel(permission.module).toLowerCase();
    const description = permission.description?.toLowerCase() ?? '';
    const action = this.getPermissionActionLabel(permission.code).toLowerCase();

    return (
      code.includes(term) ||
      module.includes(term) ||
      description.includes(term) ||
      action.includes(term)
    );
  }

  filteredPermissionGroups(): {
    module: string;
    permissions: PermissionResponse[];
  }[] {
    return this.permissionGroups
      .map((group) => ({
        module: group.module,
        permissions: group.permissions.filter((permission) =>
          this.matchesPermissionSearch(permission),
        ),
      }))
      .filter((group) => group.permissions.length > 0);
  }

  create(): void {
    if (this.form.invalid || this.loading()) {
      this.form.markAllAsTouched();
      return;
    }

    this.loading.set(true);

    const raw = this.form.getRawValue();

    this.roleService
      .createRole({
        name: raw.name.trim(),

        permissions: raw.permissions,
      })
      .subscribe({
        next: (createdRole) => {
          this.roleState.addRole(createdRole);

          this.toastService.show('Rol creado correctamente', 'success');

          this.resetForm();

          bootstrap.Modal.getInstance(document.getElementById('createRoleModal')!)?.hide();
        },

        error: (error) => {
          this.toastService.show(error.error.message, 'danger');
          this.loading.set(false);
        },

        complete: () => {
          this.loading.set(false);
        },
      });
  }

  resetForm(): void {
    this.form.reset({
      name: '',
      permissions: [],
    });
  }

  permissionInputId(permission: PermissionResponse): string {
    return `permission-${permission.code}`;
  }
}
