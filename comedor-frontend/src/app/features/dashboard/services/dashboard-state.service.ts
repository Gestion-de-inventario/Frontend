import { Injectable, signal } from '@angular/core';
import { DashboardResponse } from '../interfaces/dashboard.response';

@Injectable({
  providedIn: 'root',
})
export class DashboardStateService {
  // Estado principal de los datos
  private readonly _dashboardData = signal<DashboardResponse | null>(null);
  readonly dashboardData = this._dashboardData.asReadonly();

  // Estado de carga
  private readonly _loading = signal<boolean>(true);
  readonly loading = this._loading.asReadonly();

  // Estado de error
  private readonly _error = signal<string | null>(null);
  readonly error = this._error.asReadonly();

  setDashboardData(data: DashboardResponse): void {
    this._dashboardData.set(data);
    this._loading.set(false);
    this._error.set(null);
  }

  setLoading(isLoading: boolean): void {
    this._loading.set(isLoading);
  }

  setError(errorMessage: string): void {
    this._error.set(errorMessage);
    this._loading.set(false);
  }
}