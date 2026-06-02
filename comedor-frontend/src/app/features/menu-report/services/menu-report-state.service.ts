import { inject, Injectable, signal } from '@angular/core';
import { of } from 'rxjs';
import { MenuReportDetailResponse } from '../interfaces/menu-report.response';
import { MenuReportApiService } from './menu-report-api.service';
import { tap } from 'rxjs/internal/operators/tap';
import { AuthStateService } from '@core/auth/services/auth-state.service';

@Injectable({
  providedIn: 'root',
})
export class MenuReportStateService {
  private readonly menuReportService = inject(MenuReportApiService);
  readonly authState = inject(AuthStateService);
  private readonly _report = signal<MenuReportDetailResponse | null>(null);
  readonly report = this._report.asReadonly();

  setReport(report: MenuReportDetailResponse): void {
    this._report.set(report);
  }

  clearReport(): void {
    this._report.set(null);
  }

  updateReport(report: MenuReportDetailResponse): void {
    this._report.set(report);
  }

  getOrLoadTodayReport(date: string) {
    if (this._report()) {
      return of(this._report());
    }
    if (!this.authState.hasPermission('MENU_REPORT_GET_BY_DATE')) return of(null);
    return this.menuReportService.getByDate(date).pipe(tap((r) => this._report.set(r)));
  }
}
