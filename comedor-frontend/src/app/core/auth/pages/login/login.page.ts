import { Component, inject, signal } from '@angular/core';

import { FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';

import { Router } from '@angular/router';

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

  readonly form = new FormGroup({
    username: new FormControl('', {
      nonNullable: true,

      validators: [
        Validators.required,
        Validators.minLength(8),
        Validators.maxLength(8),
        Validators.pattern(/^[0-9]{8}$/),
      ],
    }),

    password: new FormControl('', {
      nonNullable: true,
      validators: [Validators.required, Validators.maxLength(40)],
    }),
  });

  isLoading = signal<boolean>(false);

  login(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();

      return;
    }

    this.isLoading.set(true);

    this.authState.login(this.form.getRawValue()).subscribe({
      next: () => {
        this.isLoading.set(false);

        this.router.navigate(['/dashboard']);
      },

      error: (error) => {
        this.toastService.show(error.error.message, 'danger');
        this.isLoading.set(false);
      },
    });
  }

  onlyDniNumbers(event: Event): void {
    const input = event.target as HTMLInputElement;

    const cleaned = input.value.replace(/\D/g, '').slice(0, 8);

    if (input.value !== cleaned) {
      input.value = cleaned;
    }

    this.form.controls.username.setValue(cleaned, { emitEvent: false });
  }
}
