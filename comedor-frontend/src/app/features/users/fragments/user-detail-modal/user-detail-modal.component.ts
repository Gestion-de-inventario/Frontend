import { Component, computed, inject } from '@angular/core';

import { FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';

import { CommonModule } from '@angular/common';

import { AuthStateService } from '@core/auth/services/auth-state.service';

import { ToastService } from '@shared/services/toast.service';

import { UserStateService } from '../../services/user-state.service';

import { UserService } from '@features/users/services/user-api.service';

import { RoleService } from '@features/roles_permissions/services/role-api.service';

import { MinRoleResponse } from '@features/roles_permissions/interfaces/min.role.response';

@Component({
  selector: 'app-user-detail-modal',

  standalone: true,

  imports: [CommonModule, ReactiveFormsModule],

  templateUrl: './user-detail-modal.component.html',

  styleUrls: ['./user-detail-modal.component.scss'],
})
export class UserDetailModalComponent {
  roles: MinRoleResponse[] = [];
  private readonly roleService = inject(RoleService);

  readonly authState = inject(AuthStateService);

  private readonly userState = inject(UserStateService);

  private readonly userService = inject(UserService);

  private readonly toastService = inject(ToastService);

  readonly user = computed(() => this.userState.selectedUser());

  mode: 'view' | 'edit' = 'view';

  constructor() {
    this.roleService.listMinRolesByStatus('ACTIVO').subscribe((roles) => {
      this.roles = roles;
    });
  }

  readonly form = new FormGroup({
    name: new FormControl('', {
      nonNullable: true,
      validators: [Validators.required],
    }),

    lastname: new FormControl('', {
      nonNullable: true,
      validators: [Validators.required],
    }),

    dni: new FormControl('', {
      nonNullable: true,
      validators: [Validators.required],
    }),

    password: new FormControl('', {
      nonNullable: true,
    }),

    role_id: new FormControl(0, {
      nonNullable: true,
      validators: [Validators.required],
    }),
  });

  openEdit(): void {
    const user = this.user();

    if (!user) {
      return;
    }

    this.form.patchValue({
      name: user.name,

      lastname: user.lastname,

      dni: user.dni,

      role_id: user.role_id,
    });

    this.mode = 'edit';
  }

  goBack(): void {
    this.mode = 'view';
  }

  save(): void {
    const user = this.user();

    if (!user || this.form.invalid) {
      return;
    }

    this.userService
      .editUser(user.user_id, {
        ...this.form.getRawValue(),
      })
      .subscribe({
        next: (updatedUser) => {
          this.userState.updateUser(updatedUser);

          this.toastService.show('Usuario actualizado', 'success');

          this.mode = 'view';
        },

        error: () => {
          this.toastService.show('No se pudo actualizar', 'danger');
        },
      });
  }

  activate(): void {
    const user = this.user();

    if (!user) {
      return;
    }

    this.userService.activateUser(user.user_id).subscribe({
      next: (updatedUser) => {
        this.userState.updateUser(updatedUser);

        this.toastService.show('Usuario activado', 'success');
      },

      error: () => {
        this.toastService.show('No se pudo activar', 'danger');
      },
    });
  }

  deactivate(): void {
    const user = this.user();

    if (!user) {
      return;
    }

    this.userService.deactivateUser(user.user_id).subscribe({
      next: (updatedUser) => {
        this.userState.updateUser(updatedUser);

        this.toastService.show('Usuario desactivado', 'warning');
      },

      error: () => {
        this.toastService.show('No se pudo desactivar', 'danger');
      },
    });
  }

  close(): void {
    this.mode = 'view';

    this.userState.clearSelectedUser();
  }
}
