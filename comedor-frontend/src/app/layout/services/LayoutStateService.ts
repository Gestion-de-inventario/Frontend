import { Injectable, signal } from '@angular/core';

@Injectable({
  providedIn: 'root',
})
export class LayoutStateService {
  private readonly _sidebarOpen = signal(false);

  readonly sidebarOpen = this._sidebarOpen.asReadonly();

  toggleSidebar(): void {
    this._sidebarOpen.update((v) => !v);
  }

  closeSidebar(): void {
    this._sidebarOpen.set(false);
  }
}
