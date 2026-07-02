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
      validators: [Validators.required, Validators.minLength(2), Validators.maxLength(50), Validators.pattern(/^[A-Za-zÁÉÍÓÚáéíóúÑñ\s]+$/)],
    }),

    lastname: new FormControl('', {
      nonNullable: true,
      validators: [Validators.required, Validators.minLength(2), Validators.maxLength(50), Validators.pattern(/^[A-Za-zÁÉÍÓÚáéíóúÑñ\s]+$/)],
    }),

    dni: new FormControl('', {
      nonNullable: true,
      validators: [Validators.required, Validators.minLength(8), Validators.maxLength(8), Validators.pattern(/^[0-9]+$/)],
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
        this.loading = false;
      },
      complete: () => {
        this.loading = false;
      },
    });
  }

  onDniInput(event: Event): void {
    const input = event.target as HTMLInputElement;
    const cleaned = input.value.replace(/[^0-9]/g, '').slice(0, 8);
    if (cleaned !== input.value) {
      this.form.controls.dni.setValue(cleaned, { emitEvent: false });
    }
  }

  onNameInput(event: Event, controlName: 'name' | 'lastname'): void {
    const input = event.target as HTMLInputElement;
    const cleaned = input.value.replace(/[^A-Za-zÁÉÍÓÚáéíóúÑñ\s]/g, '');
    if (cleaned !== input.value) {
      this.form.controls[controlName].setValue(cleaned, { emitEvent: false });
    }
  }
}
