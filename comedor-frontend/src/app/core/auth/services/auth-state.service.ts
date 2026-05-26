import { Injectable, inject, signal, computed } from '@angular/core';

import { Observable, tap, map } from 'rxjs';

import { AuthService } from './auth-api.service.ts';

import { TokenService } from './token.service';

import { AuthRequest } from '../interfaces/auth-request.interface';

import { AuthResponse } from '../interfaces/auth-response.interface';

@Injectable({
  providedIn: 'root',
})
export class AuthStateService {
  private readonly authApi = inject(AuthService);

  private readonly tokenService = inject(TokenService);

  private readonly _session = signal<AuthResponse | null>(null);

  readonly session = this._session.asReadonly();

  readonly permissions = computed(() => this._session()?.permissions ?? []);

  readonly role = computed(() => this._session()?.role ?? null);

  readonly isAuthenticated = computed(() => !!this._session());

  login(request: AuthRequest) {
    return this.authApi.login(request).pipe(
      tap((response) => {
        this.tokenService.saveToken(response.token);

        this._session.set(response);
      }),
    );
  }

  logout(): Observable<void> {
    return this.authApi.logout().pipe(
      tap(() => {
        this.tokenService.removeToken();
        this._session.set(null);
      }),
      map(() => void 0),
    );
  }

  initAuth() {
    return this.authApi.refresh().pipe(
      tap((response) => {
        this.tokenService.saveToken(response.token);
        this._session.set(response);
      }),
    );
  }

  hasPermission(permission: string): boolean {
    return this.permissions().includes(permission);
  }

  refreshSession() {
    return this.authApi.me().pipe(
      tap((response) => {
        this._session.update((current) => ({
          ...response,
          token: current?.token ?? '',
        }));
      }),
    );
  }
}

export function initAuth(authState: AuthStateService) {
  return () =>
    authState
      .initAuth()
      .toPromise()
      .catch(() => {});
}
