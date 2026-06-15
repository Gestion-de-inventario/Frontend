import { Component, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { MenuReportApiService } from '@features/menu-report/services/menu-report-api.service';
import { ListMenuReportDetailResponse } from '@features/menu-report/interfaces/menu-report.response';

import { finalize } from 'rxjs/operators';
import { catchError } from 'rxjs/operators';
import { of } from 'rxjs';

const today = new Intl.DateTimeFormat('en-CA', {
  timeZone: 'America/Lima',
  year: 'numeric',
  month: '2-digit',
  day: '2-digit',
}).format(new Date());

@Component({
  selector: 'app-menu-report-summary-fragment',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './menu-report-summary-fragment.component.html',
})
export class MenuReportSummaryFragmentComponent {
  private readonly menuReportService = inject(MenuReportApiService);

  summary = signal<ListMenuReportDetailResponse | null>(null);

  loading = signal(false);

  generatingPdf = signal(false);

  startDate = signal(today);
  endDate = signal('');

  constructor() {
    this.search();
  }

  search(): void {
    this.loading.set(true);

    this.menuReportService
      .getByDate(this.startDate() || undefined, this.endDate() || undefined)
      .pipe(
        catchError(() => {
          this.summary.set(null);
          return of(null);
        }),
        finalize(() => {
          this.loading.set(false);
        }),
      )
      .subscribe((response) => {
        if (response) {
          this.summary.set(response);
        }
      });
  }

  clearFilters(): void {
    this.startDate.set('');
    this.endDate.set('');

    this.search();
  }

  refreshSummary(): void {
    this.search();
  }
  exportarResumen() {
    this.generatingPdf.set(true);
    this.menuReportService.exportPdf(this.startDate(), this.endDate()).subscribe((file) => {
      const blob = new Blob([file], { type: 'application/pdf' });

      const url = window.URL.createObjectURL(blob);

      const a = document.createElement('a');

      a.href = url;

      a.download = `reporte.pdf`;

      a.click();

      window.URL.revokeObjectURL(url);
      this.generatingPdf.set(false);
    });
  }
}
