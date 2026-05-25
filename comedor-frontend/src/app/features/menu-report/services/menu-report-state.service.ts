import { Injectable, signal } from '@angular/core';
import { MenuReportDetailResponse } from '../interfaces/menu-report.response';

@Injectable({
  providedIn: 'root',
})
export class MenuReportStateService {
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
}