import { Injectable, signal } from '@angular/core';

@Injectable({
  providedIn: 'root',
})
export class TokenService {
  private readonly _token = signal<string | null>(null);

  readonly token = this._token.asReadonly();

  getToken(): string | null {
    return this._token();
  }

  hasToken(): boolean {
    return !!this._token();
  }

  saveToken(token: string): void {
    this._token.set(token);
  }

  removeToken(): void {
    this._token.set(null);
  }
}
