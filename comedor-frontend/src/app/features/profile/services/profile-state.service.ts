import { Injectable, signal } from '@angular/core';

@Injectable({
  providedIn: 'root',
})
export class ProfileStateService {
  private readonly _phone = signal<string | null>(null);

  readonly phone = this._phone.asReadonly();

  setPhone(phone: string): void {
    this._phone.set(phone);
  }

  clear(): void {
    this._phone.set(null);
  }
}
