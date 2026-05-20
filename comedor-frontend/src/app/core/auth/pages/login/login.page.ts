import { Component, inject } from '@angular/core';

import { FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';

import { Router } from '@angular/router';

import { AuthStateService } from '../../services/auth-state.service';

import { ButtonComponent } from '@shared/components/ui/button/button';

@Component({
  selector: 'app-login-page',

  standalone: true,

  imports: [ReactiveFormsModule, ButtonComponent],

  templateUrl: './login.page.html',

  styleUrls: ['./login.page.scss'],
})
export class LoginPage {
  private readonly authState = inject(AuthStateService);

  private readonly router = inject(Router);

  readonly form = new FormGroup({
    username: new FormControl('', {
      nonNullable: true,

      validators: [Validators.required, Validators.maxLength(8), Validators.pattern(/^[0-9]+$/)],
    }),

    password: new FormControl('', {
      nonNullable: true,

      validators: [Validators.required],
    }),
  });

  isLoading = false;

  login(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();

      return;
    }

    this.isLoading = true;

    this.authState.login(this.form.getRawValue()).subscribe({
      next: () => {
        this.isLoading = false;

        this.router.navigate(['/dashboard']);
      },

      error: () => {
        this.isLoading = false;
      },
    });
  }

  logout(): void {
    this.authState.logout();
    this.router.navigateByUrl('/login');
  }
}
