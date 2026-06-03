import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AbstractControl, FormControl, FormGroup, ReactiveFormsModule, ValidationErrors, Validators } from '@angular/forms';

import { AuthStateService } from '@core/auth/services/auth-state.service';
import { UserService } from '@features/users/services/user-api.service';
import { ToastService } from '@shared/services/toast.service';
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
  selector: 'app-password-change-modal',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './password-change-modal.html',
  styleUrl: './password-change-modal.scss' // Recuerda usar styleUrl en singular
})
export class PasswordChangeModalComponent implements OnInit {

  readonly authState = inject(AuthStateService);
  private readonly userService = inject(UserService);
  private readonly toastService = inject(ToastService);

  loadingPassword = false;

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

  ngOnInit(): void {
    this.verificarCambioPassword();
  }

  verificarCambioPassword(): void {
    const session = this.authState.session(); 
    
    // Apenas nace el componente, verifica si debe abrirse
    if (session && session.passwordChanged === false) {
      setTimeout(() => {
        const modalElement = document.getElementById('optionalPasswordModal');
        if (modalElement) {
          const modal = new bootstrap.Modal(modalElement);
          modal.show();
        }
      }, 300);
    }
  }

  savePassword(): void {
    if (this.passwordForm.invalid || this.loadingPassword) return;
    this.loadingPassword = true;

    const { currentPassword, newPassword } = this.passwordForm.getRawValue();
    const request: ChangePasswordRequest = { currentPassword, newPassword };

    this.userService.changeMyPassword(request).subscribe({
      next: () => {
        this.toastService.show('Contraseña actualizada correctamente', 'success');
        
        const sesionActual = this.authState.session();
        if(sesionActual) {
          this.authState.updateSession({ ...sesionActual, passwordChanged: true });
        }

        this.passwordForm.reset();
        bootstrap.Modal.getInstance(document.getElementById('optionalPasswordModal')!)?.hide();
      },
      error: (error) => {
        this.toastService.show('Error: ' + (error.error?.message ?? error.error), 'danger');
        this.loadingPassword = false;
      },
      complete: () => {
        this.loadingPassword = false;
      }
    });
  }
}