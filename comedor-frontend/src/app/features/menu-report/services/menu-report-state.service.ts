import { inject, Injectable, signal } from '@angular/core';
import { of } from 'rxjs';
import {
  ListMenuReportDetailResponse,
  MenuReportResponse,
} from '../interfaces/menu-report.response';
import { MenuReportApiService } from './menu-report-api.service';
import { tap } from 'rxjs/internal/operators/tap';
import { AuthStateService } from '@core/auth/services/auth-state.service';
import { MenuPageResponse } from '@features/menu-report-summary/interfaces/menu-report-page.response';
@Injectable({
  providedIn: 'root',
})
export class MenuReportStateService {
  private readonly menuReportService = inject(MenuReportApiService);

  readonly authState = inject(AuthStateService);

  private readonly _menuReportsPage = signal<MenuPageResponse | null>(null);

  private readonly _menuReportSummary = signal<ListMenuReportDetailResponse | null>(null);

  selectedReport = signal<MenuReportResponse | null>(null);

  duplicateSourceReport = signal<MenuReportResponse | null>(null);

  readonly menuReportsPage = this._menuReportsPage.asReadonly();

  readonly menuReportSummary = this._menuReportSummary.asReadonly();

  clear(): void {
    this._menuReportsPage.set(null);
    this._menuReportSummary.set(null);
  }

  loadSummary(startDate?: string, endDate?: string) {
    if (!this.authState.hasPermission('MENU_REPORT_GET_BY_DATE')) {
      return of(null);
    }

    return this.menuReportService
      .getByDate(startDate, endDate)
      .pipe(tap((summary) => this._menuReportSummary.set(summary)));
  }

  loadPage(page = 0, size = 20, startDate?: string, endDate?: string) {
    if (!this.authState.hasPermission('MENU_REPORT_LIST_ALL')) {
      return of(null);
    }

    return this.menuReportService
      .list(page, size, startDate, endDate)
      .pipe(tap((response) => this._menuReportsPage.set(response)));
  }

  setSelectedReport(report: MenuReportResponse) {
    this.selectedReport.set(report);
  }

  clearSelectedReport() {
    this.selectedReport.set(null);
  }

  setDuplicateSource(report: MenuReportResponse): void {
    this.duplicateSourceReport.set(report);
  }

  clearDuplicateSource(): void {
    this.duplicateSourceReport.set(null);
  }
}
