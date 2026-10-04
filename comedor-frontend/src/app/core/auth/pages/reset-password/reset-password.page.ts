import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import {
  AbstractControl,
  FormControl,
  FormGroup,
  ReactiveFormsModule,
  ValidationErrors,
  Validators,
} from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { finalize } from 'rxjs';

import { AuthService } from '@core/auth/services/auth-api.service.ts';
import { ToastComponent } from '@shared/components/toast/toast.component';
import { ButtonComponent } from '@shared/components/ui/button/button';

@Component({
  selector: 'app-reset-password',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, ToastComponent, ButtonComponent],
  templateUrl: './reset-password.page.html',
  styleUrls: ['./reset-password.page.scss'],
})
export class ResetPasswordPage implements OnInit {
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly authService = inject(AuthService);

  readonly token = signal<string | null>(null);
  readonly isValidatingToken = signal(true);
  readonly tokenInvalid = signal(false);
  readonly tokenErrorMessage = signal('El enlace de recuperación es inválido o ha expirado.');

  readonly showPassword = signal(false);
  readonly isSubmitting = signal(false);
  readonly resetSuccess = signal(false);
  readonly submitError = signal<string | null>(null);

  readonly form = new FormGroup(
    {
      newPassword: new FormControl('', {
        nonNullable: true,
        validators: [Validators.required, Validators.minLength(6)],
      }),
      confirmPassword: new FormControl('', {
        nonNullable: true,
        validators: [Validators.required],
      }),
    },
    {
      validators: (control: AbstractControl): ValidationErrors | null => {
        const newPassword = control.get('newPassword')?.value;
        const confirmPassword = control.get('confirmPassword')?.value;
        return newPassword && confirmPassword && newPassword !== confirmPassword
          ? { mismatch: true }
          : null;
      },
    },
  );

  ngOnInit(): void {
    const tokenParam = this.route.snapshot.queryParamMap.get('token');
    if (!tokenParam) {
      this.isValidatingToken.set(false);
      this.tokenInvalid.set(true);
      return;
    }

    this.token.set(tokenParam);
    this.authService
      .validateResetToken(tokenParam)
      .pipe(finalize(() => this.isValidatingToken.set(false)))
      .subscribe({
        next: (res) => {
          if (!res.valid) {
            this.tokenInvalid.set(true);
            if (res.message) {
              this.tokenErrorMessage.set(res.message);
            }
          }
        },
        error: (err) => {
          this.tokenInvalid.set(true);
          this.tokenErrorMessage.set(
            err.error?.message || 'El enlace de recuperación ha expirado o ya fue utilizado.',
          );
        },
      });
  }

  togglePasswordVisibility(): void {
    this.showPassword.update((prev) => !prev);
  }

  onSubmit(): void {
    if (this.form.invalid || !this.token()) {
      this.form.markAllAsTouched();
      return;
    }

    this.isSubmitting.set(true);
    this.submitError.set(null);

    const { newPassword } = this.form.getRawValue();

    this.authService
      .confirmPasswordReset({
        token: this.token()!,
        newPassword: newPassword,
      })
      .pipe(finalize(() => this.isSubmitting.set(false)))
      .subscribe({
        next: () => {
          this.resetSuccess.set(true);
        },
        error: (err) => {
          this.submitError.set(
            err.error?.message || 'No fue posible restablecer la contraseña. Intente nuevamente.',
          );
        },
      });
  }

  goToForgotPassword(): void {
    this.router.navigate(['/forgot-password']);
  }

  goToLogin(): void {
    this.router.navigate(['/login']);
  }
}
