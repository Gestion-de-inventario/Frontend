import { Component, inject, signal } from '@angular/core';

import { FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';

import { CommonModule } from '@angular/common';

import { RoleService } from '@features/roles_permissions/services/role-api.service';

import { PermissionService } from '@features/roles_permissions/services/permissions-api.service';

import { RoleStateService } from '@features/roles_permissions/services/role-state.service';

import { ToastService } from '@shared/services/toast.service';

import { PermissionResponse } from '@features/roles_permissions/interfaces/permission.response';

declare const bootstrap: any;

@Component({
  selector: 'app-role-create-fragment',

  standalone: true,

  imports: [CommonModule, ReactiveFormsModule],

  templateUrl: './role-create-fragment.component.html',

  styleUrls: ['./role-create-fragment.component.scss'],
})
export class RoleCreateFragmentComponent {
  private readonly roleService = inject(RoleService);

  private readonly permissionService = inject(PermissionService);

  private readonly roleState = inject(RoleStateService);

  private readonly toastService = inject(ToastService);

  permissions: PermissionResponse[] = [];

  loading = signal<boolean>(false);

  readonly form = new FormGroup({
    name: new FormControl('', {
      nonNullable: true,
      validators: [Validators.required],
    }),

    permissions: new FormControl<string[]>([], {
      nonNullable: true,
    }),
  });

  constructor() {
    this.loadPermissions();
  }

  loadPermissions(): void {
    this.permissionService.getAllPermissions().subscribe({
      next: (permissions) => {
        this.permissions = permissions;
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

  create(): void {
    if (this.form.invalid || this.loading()) {
      return;
    }

    this.loading.set(true);

    this.roleService
      .createRole({
        name: this.form.controls.name.value,

        permissions: this.form.controls.permissions.value,
      })
      .subscribe({
        next: (createdRole) => {
          this.roleState.addRole(createdRole);

          this.toastService.show('Rol creado correctamente', 'success');

          this.form.reset({
            name: '',
            permissions: [],
          });

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
}
