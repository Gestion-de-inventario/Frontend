import { Component, ElementRef, ViewChild, inject, signal } from '@angular/core';
import { FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { finalize } from 'rxjs';

import { AuthStateService } from '../../services/auth-state.service';
import { ButtonComponent } from '@shared/components/ui/button/button';
import { ToastService } from '@shared/services/toast.service';
import { ToastComponent } from '@shared/components/toast/toast.component';

@Component({
  selector: 'app-login-page',
  standalone: true,
  imports: [ReactiveFormsModule, ButtonComponent, ToastComponent],
  templateUrl: './login.page.html',
  styleUrls: ['./login.page.scss'],
})
export class LoginPage {
  private readonly authState = inject(AuthStateService);
  private readonly toastService = inject(ToastService);
  private readonly router = inject(Router);

  @ViewChild('usernameInput') usernameInput?: ElementRef<HTMLInputElement>;
  @ViewChild('passwordInput') passwordInput?: ElementRef<HTMLInputElement>;

  readonly form = new FormGroup({
    username: new FormControl('', {
      nonNullable: true,
      validators: [Validators.required, Validators.pattern(/^\d{8}$/)],
    }),

    password: new FormControl('', {
      nonNullable: true,
      validators: [Validators.required],
    }),
  });

  isLoading = signal<boolean>(false);
  showPassword = signal<boolean>(false);
  loginError = signal<string | null>(null);

  togglePasswordVisibility(): void {
    this.showPassword.update((value) => !value);
  }

  clearForm(): void {
    this.form.reset();
    this.loginError.set(null);
    this.usernameInput?.nativeElement.focus();
  }

  login(): void {
    this.loginError.set(null);

    if (this.form.invalid) {
      this.form.markAllAsTouched();
      this.toastService.show('Revisa los campos marcados antes de continuar.', 'warning');
      this.focusFirstInvalidControl();
      return;
    }

    this.isLoading.set(true);

    this.authState
      .login(this.form.getRawValue())
      .pipe(finalize(() => this.isLoading.set(false)))
      .subscribe({
        next: () => {
          this.router.navigate(['/dashboard']);
        },

        error: () => {
          const message =
            'No se pudo iniciar sesión. Verifica tu DNI, contraseña o conexión e inténtalo nuevamente.';

          this.loginError.set(message);
          this.toastService.show(message, 'danger');
          this.passwordInput?.nativeElement.focus();
        },
      });
  }

  private focusFirstInvalidControl(): void {
    if (this.form.controls.username.invalid) {
      this.usernameInput?.nativeElement.focus();
      return;
    }

    if (this.form.controls.password.invalid) {
      this.passwordInput?.nativeElement.focus();
    }
  }
}
