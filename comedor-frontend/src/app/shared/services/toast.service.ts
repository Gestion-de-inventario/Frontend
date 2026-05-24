import { Injectable, signal } from '@angular/core';

export interface Toast {
  message: string;

  type: 'success' | 'danger' | 'warning' | 'info';
}

@Injectable({
  providedIn: 'root',
})
export class ToastService {
  private readonly _toast = signal<Toast | null>(null);

  readonly toast = this._toast.asReadonly();

  show(message: string, type: Toast['type'] = 'success'): void {
    this._toast.set({
      message,
      type,
    });

    setTimeout(() => {
      this.clear();
    }, 3000);
  }

  clear(): void {
    this._toast.set(null);
  }
}
