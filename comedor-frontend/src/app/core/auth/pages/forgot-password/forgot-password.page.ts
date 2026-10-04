import { Component, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { finalize } from 'rxjs';

import { AuthService } from '@core/auth/services/auth-api.service.ts';
import { ToastComponent } from '@shared/components/toast/toast.component';
import { ButtonComponent } from '@shared/components/ui/button/button';

@Component({
  selector: 'app-forgot-password',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, ToastComponent, ButtonComponent],
  templateUrl: './forgot-password.page.html',
  styleUrls: ['./forgot-password.page.scss'],
})
export class ForgotPasswordPage {
  private readonly authService = inject(AuthService);
  private readonly router = inject(Router);

  readonly isLoading = signal(false);
  readonly submittedSuccess = signal(false);
  readonly errorMessage = signal<string | null>(null);

  readonly form = new FormGroup({
    dni: new FormControl('', {
      nonNullable: true,
      validators: [Validators.required, Validators.pattern(/^\d{8}$/)],
    }),
    phone: new FormControl('', {
      nonNullable: true,
      validators: [Validators.required, Validators.pattern(/^9\d{8}$/)],
    }),
  });

  onSubmit(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    this.isLoading.set(true);
    this.errorMessage.set(null);

    const { dni, phone } = this.form.getRawValue();

    this.authService
      .requestPasswordReset({
        dni: dni.trim(),
        phone: phone.trim(),
      })
      .pipe(finalize(() => this.isLoading.set(false)))
      .subscribe({
        next: () => {
          this.submittedSuccess.set(true);
        },
        error: (err) => {
          this.errorMessage.set(
            err.error?.message || 'Ocurrió un error al procesar la solicitud. Intenta nuevamente.',
          );
        },
      });
  }

  goToLogin(): void {
    this.router.navigate(['/login']);
  }
}
