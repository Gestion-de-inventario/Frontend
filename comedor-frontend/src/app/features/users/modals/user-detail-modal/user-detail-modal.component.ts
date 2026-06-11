import { Component, computed, inject, signal } from '@angular/core';

import { FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';

import { CommonModule } from '@angular/common';

import { AuthStateService } from '@core/auth/services/auth-state.service';

import { ToastService } from '@shared/services/toast.service';

import { UserStateService } from '../../services/user-state.service';

import { UserService } from '@features/users/services/user-api.service';

import { RoleService } from '@features/roles_permissions/services/role-api.service';

import { MinRoleResponse } from '@features/roles_permissions/interfaces/min.role.response';
import { finalize } from 'rxjs/internal/operators/finalize';

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

  mode: 'view' | 'edit' | 'change-password' = 'view';

  loading = signal(false);

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
    role_id: new FormControl(0, {
      nonNullable: true,
      validators: [Validators.required],
    }),
  });

  readonly passwordForm = new FormGroup({
    newPassword: new FormControl('', {
      nonNullable: true,
      validators: [Validators.required, Validators.minLength(8)],
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

  openForceChangePassword(): void {
    const user = this.user();

    if (!user) {
      return;
    }

    this.passwordForm.reset();

    this.mode = 'change-password';
  }

  savePassword(): void {
    const user = this.user();

    if (!user || this.passwordForm.invalid || this.loading()) {
      return;
    }

    this.loading.set(true);

    this.userService
      .changePasswordUser(user.user_id, {
        newPassword: this.passwordForm.controls.newPassword.value,
      })
      .pipe(
        finalize(() => {
          this.loading.set(false);
        }),
      )
      .subscribe({
        next: () => {
          this.loading.set(false);
          this.toastService.show('Contraseña actualizada correctamente', 'success');
          this.mode = 'view';
        },

        error: (error) => {
          this.toastService.show('No se pudo actualizar: ' + error.error.message, 'danger');
        },
      });
  }

  goBack(): void {
    this.mode = 'view';
  }

  save(): void {
    const user = this.user();

    if (!user || this.form.invalid || this.loading()) {
      return;
    }

    this.loading.set(true);

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

        error: (error) => {
          this.toastService.show('No se pudo actualizar : ' + error.error.message, 'danger');
          this.loading.set(false);
        },

        complete: () => {
          this.loading.set(false);
        },
      });
  }

  activate(): void {
    const user = this.user();

    if (!user || this.loading()) {
      return;
    }

    if (user.status === 'ACTIVO') {
      this.toastService.show('El usuario ya está activo', 'warning');

      return;
    }

    this.loading.set(true);

    this.userService.activateUser(user.user_id).subscribe({
      next: (updatedUser) => {
        this.userState.updateUser(updatedUser);

        this.toastService.show('Usuario activado', 'success');
      },

      error: (error) => {
        this.toastService.show('No se pudo activar: ' + error.error.message, 'danger');
        this.loading.set(false);
      },
      complete: () => {
        this.loading.set(false);
      },
    });
  }

  deactivate(): void {
    const user = this.user();

    if (!user) {
      return;
    }

    if (user.status === 'INACTIVO') {
      this.toastService.show('El usuario ya está inactivo', 'warning');

      return;
    }

    this.loading.set(true);

    this.userService.deactivateUser(user.user_id).subscribe({
      next: (updatedUser) => {
        this.userState.updateUser(updatedUser);

        this.toastService.show('Usuario desactivado', 'warning');
      },

      error: (error) => {
        this.toastService.show('No se pudo desactivar: ' + error.error.message, 'danger');
        this.loading.set(false);
      },
      complete: () => {
        this.loading.set(false);
      },
    });
  }

  close(): void {
    this.mode = 'view';

    this.userState.clearSelectedUser();
  }
}
