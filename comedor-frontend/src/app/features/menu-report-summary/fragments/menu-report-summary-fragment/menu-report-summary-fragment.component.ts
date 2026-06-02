import { Component, effect, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MenuReportApiService } from '@features/menu-report/services/menu-report-api.service';
import { MenuReportStateService } from '@features/menu-report/services/menu-report-state.service';
import { MenuReportSummaryResponse } from '@features/menu-report-summary/interfaces/menu-report-summary-response';
import { finalize } from 'rxjs/internal/operators/finalize';
import { catchError } from 'rxjs/internal/operators/catchError';
import { switchMap } from 'rxjs/internal/operators/switchMap';
import { of } from 'rxjs';

const LocalToday = new Date();

const localDate =
  LocalToday.getFullYear() +
  '-' +
  String(LocalToday.getMonth() + 1).padStart(2, '0') +
  '-' +
  String(LocalToday.getDate()).padStart(2, '0');

@Component({
  selector: 'app-menu-report-summary-fragment',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './menu-report-summary-fragment.component.html',
})
export class MenuReportSummaryFragmentComponent {
  private readonly menuReportService = inject(MenuReportApiService);
  private readonly menuReportState = inject(MenuReportStateService);

  readonly report = this.menuReportState.report;
  readonly reportId = signal<number | null>(null);
  summary = signal<MenuReportSummaryResponse | null>(null);
  loadingSummary = signal(false);

  private lastDate: string | null = null;

  constructor() {
    effect(() => {
      if (this.lastDate === localDate) return;

      this.lastDate = localDate;

      this.loadSummary(localDate);
    });
  }

  loadSummary(date: string): void {
    this.loadingSummary.set(true);

    this.menuReportState
      .getOrLoadTodayReport(date)
      .pipe(
        switchMap((report) => {
          if (!report?.id) {
            throw new Error('No report found');
          }

          this.reportId.set(report.id);

          return this.menuReportService.getSummary(report.id);
        }),

        catchError(() => {
          this.summary.set(null);
          return of(null);
        }),

        finalize(() => {
          this.loadingSummary.set(false);
        }),
      )
      .subscribe((summary) => {
        this.summary.set(summary);
      });
  }

  refreshSummary(): void {
    const id = this.reportId();

    if (!id) return;

    this.loadingSummary.set(true);

    this.menuReportService
      .getSummary(id)
      .pipe(
        catchError(() => {
          this.summary.set(null);
          return of(null);
        }),
        finalize(() => {
          this.loadingSummary.set(false);
        }),
      )
      .subscribe((summary) => {
        this.summary.set(summary);
      });
  }
}
