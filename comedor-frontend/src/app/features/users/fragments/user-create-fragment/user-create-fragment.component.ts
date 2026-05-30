import { Component, inject } from '@angular/core';

import { FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';

import { CommonModule } from '@angular/common';

import { UserService } from '@features/users/services/user-api.service';

import { UserStateService } from '../../services/user-state.service';

import { ToastService } from '@shared/services/toast.service';

import { RoleService } from '@features/roles_permissions/services/role-api.service';

import { MinRoleResponse } from '@features/roles_permissions/interfaces/min.role.response';

declare const bootstrap: any;

@Component({
  selector: 'app-user-create-fragment',

  standalone: true,

  imports: [CommonModule, ReactiveFormsModule],

  templateUrl: './user-create-fragment.component.html',

  styleUrls: ['./user-create-fragment.component.scss'],
})
export class UserCreateFragmentComponent {
  private readonly userService = inject(UserService);

  private readonly userState = inject(UserStateService);

  private readonly toastService = inject(ToastService);

  private readonly roleService = inject(RoleService);

  roles: MinRoleResponse[] = [];
  loading = false;
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
      validators: [Validators.required, Validators.minLength(8), Validators.maxLength(8)],
    }),

    password: new FormControl('', {
      nonNullable: true,
      validators: [Validators.required],
    }),

    role_id: new FormControl<number | null>(null, {
      validators: [Validators.required],
    }),
  });

  constructor() {
    this.loadRoles();
  }

  loadRoles(): void {
    this.roleService.listMinRolesByStatus('ACTIVO').subscribe({
      next: (roles) => {
        this.roles = roles;
      },
    });
  }

  openModal(): void {
    const modal = new bootstrap.Modal(document.getElementById('createUserModal'));

    modal.show();
  }

  create(): void {
    if (this.form.invalid || this.loading) {
      return;
    }

    this.loading = true;

    this.userService.createUser(this.form.getRawValue()).subscribe({
      next: (createdUser) => {
        this.userState.addUser(createdUser);

        this.toastService.show('Usuario creado correctamente', 'success');

        this.form.reset({
          name: '',
          lastname: '',
          dni: '',
          password: '',
          role_id: null,
        });

        bootstrap.Modal.getInstance(document.getElementById('createUserModal')!)?.hide();
      },

      error: (error) => {
        this.toastService.show('No se pudo crear el usuario :' + error.error.message, 'danger');
      },
      complete: () => {
        this.loading = false;
      },
    });
  }
}
