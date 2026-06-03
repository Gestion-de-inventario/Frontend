import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AbstractControl, FormControl, FormGroup, ReactiveFormsModule, ValidationErrors, Validators } from '@angular/forms';
import { AuthStateService } from '@core/auth/services/auth-state.service';
import { UserService } from '@features/users/services/user-api.service';
import { ToastService } from '@shared/services/toast.service';
import { EditProfileRequest } from '@features/profile/interfaces/edit-profile.request';
import { ChangePasswordRequest } from '@features/profile/interfaces/change-password.request';

declare const bootstrap: any;

function passwordMatchValidator(control: AbstractControl): ValidationErrors | null {
  const newPassword = control.get('newPassword')?.value;
  const confirmPassword = control.get('confirmPassword')?.value;
  return newPassword && confirmPassword && newPassword !== confirmPassword
    ? { mismatch: true }
    : null;
}

@Component({
  selector: 'app-profile-principal',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './profile_principal.html',
  styleUrl: './profile_principal.scss',
})
export class ProfilePrincipal {
  readonly authState = inject(AuthStateService);
  private readonly userService = inject(UserService);
  private readonly toastService = inject(ToastService);

  
  loadingEdit = false;
  loadingPassword = false;
  showCurrent = false;
  showNew = false;
  showConfirm = false;

  readonly editForm = new FormGroup({
    name: new FormControl('', { nonNullable: true }),
    lastname: new FormControl('', { nonNullable: true }),
    dni: new FormControl('', {
      nonNullable: true,
      validators: [Validators.minLength(8), Validators.maxLength(8)],
    }),
  });

  readonly passwordForm = new FormGroup({
    currentPassword: new FormControl('', {
      nonNullable: true,
      validators: [Validators.required],
    }),
    newPassword: new FormControl('', {
      nonNullable: true,
      validators: [Validators.required, Validators.minLength(8)],
    }),
    confirmPassword: new FormControl('', {
      nonNullable: true,
      validators: [Validators.required],
    }),
  }, { validators: passwordMatchValidator });

  openEditModal(): void {
    const session = this.authState.session();
    this.editForm.patchValue({
      name: session?.name ?? '',
      lastname: session?.lastname ?? '',
      dni: '',
    });
    const modal = new bootstrap.Modal(document.getElementById('editProfileModal'));
    modal.show();
  }

  openPasswordModal(): void {
    const modal = new bootstrap.Modal(document.getElementById('changePasswordModal'));
    modal.show();
  }

  saveEdit(): void {
    if (this.loadingEdit) return;
    this.loadingEdit = true;

    const raw = this.editForm.getRawValue();
    const request: EditProfileRequest = {
      name: raw.name || undefined,
      lastname: raw.lastname || undefined,
      dni: raw.dni || undefined,
    };

    this.userService.editMyProfile(request).subscribe({
      next: (updated) => {
        this.toastService.show('Datos actualizados correctamente', 'success');
        this.authState.updateSession({
          name: updated.name,
          lastname: updated.lastname,
        });
        bootstrap.Modal.getInstance(document.getElementById('editProfileModal')!)?.hide();
      },
      error: (error) => {
        this.toastService.show('No se pudo actualizar: ' + error.error.message, 'danger');
        this.loadingEdit = false;
      },
      complete: () => {
        this.loadingEdit = false;
      },
    });
  }

  savePassword(): void {
    if (this.passwordForm.invalid || this.loadingPassword) return;
    this.loadingPassword = true;

    const { currentPassword, newPassword } = this.passwordForm.getRawValue();
    const request: ChangePasswordRequest = { currentPassword, newPassword };

    this.userService.changeMyPassword(request).subscribe({
      next: () => {
        this.toastService.show('Contraseña actualizada correctamente', 'success');
        this.resetPasswordForm();
        bootstrap.Modal.getInstance(document.getElementById('changePasswordModal')!)?.hide();
      },
      error: (error) => {
        this.toastService.show('Error: ' + (error.error?.message ?? error.error), 'danger');
        this.loadingPassword = false;
      },
      complete: () => {
        this.loadingPassword = false;
      },
    });
  }

  resetPasswordForm(): void {
    this.passwordForm.reset();
    this.showCurrent = false;
    this.showNew = false;
    this.showConfirm = false;
  }
}