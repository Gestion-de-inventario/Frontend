import { Component, computed, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { MenuReportApiService } from '@features/menu-report/services/menu-report-api.service';
import { ListMenuReportDetailResponse } from '@features/menu-report/interfaces/menu-report.response';

import { finalize } from 'rxjs/operators';
import { catchError } from 'rxjs/operators';
import { of } from 'rxjs';

declare const bootstrap: any;

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
  styleUrls: ['./menu-report-summary-fragment.component.scss'],
})
export class MenuReportSummaryFragmentComponent {
  private readonly menuReportService = inject(MenuReportApiService);

  summary = signal<ListMenuReportDetailResponse | null>(null);

  loading = signal(false);

  generatingPdf = signal(false);

  generatingExcel = signal(false);

  startDate = signal(today);
  endDate = signal('');

  minDate = signal<string>(this.getPeruStartOfYear());

  maxDate = signal<string>(this.getPeruEndOfYear());

  errorMessage = signal<string | null>(null);
  successMessage = signal<string | null>(null);

  readonly isDateRangeInvalid = computed(() => {
    const start = this.startDate();
    const end = this.endDate();

    if (!start || !end) return false;

    return start > end;
  });

  constructor() {
    this.search();
  }

  search(): void {
    this.errorMessage.set(null);
    this.successMessage.set(null);

    if (this.isDateRangeInvalid()) {
      this.errorMessage.set('La fecha de inicio no puede ser mayor que la fecha fin.');
      return;
    }

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

  openExportModal(): void {
    const modalElement = document.getElementById('exportSummaryModal');

    if (!modalElement) return;

    const modal = bootstrap.Modal.getOrCreateInstance(modalElement);
    modal.show();
  }

  clearFilters(): void {
    this.startDate.set('');
    this.endDate.set('');

    //this.search();
  }

  refreshSummary(): void {
    this.search();
  }

  exportarResumenPdf(): void {
    if (this.generatingPdf()) return;

    if (this.generatingPdf() || this.isDateRangeInvalid()) {
      this.errorMessage.set('Corrige el rango de fechas antes de exportar.');
      return;
    }
    this.errorMessage.set(null);
    this.generatingPdf.set(true);

    this.generatingPdf.set(true);

    this.menuReportService
      .exportPdf(this.startDate(), this.endDate())
      .pipe(
        finalize(() => {
          this.generatingPdf.set(false);
        }),
      )
      .subscribe({
        next: (file) => {
          this.downloadFile(file, 'application/pdf', 'reporte-menu.pdf');

          bootstrap.Modal.getInstance(document.getElementById('exportSummaryModal')!)?.hide();
        },
        error: () => {
          console.error('No se pudo generar el PDF');
        },
      });
  }

  exportarResumenExcel(): void {
    if (this.generatingExcel()) return;

    if (this.generatingExcel() || this.isDateRangeInvalid()) {
      this.errorMessage.set('Corrige el rango de fechas antes de exportar.');
      return;
    }

    this.errorMessage.set(null);
    this.generatingExcel.set(true);

    this.generatingExcel.set(true);

    this.menuReportService
      .exportExcel(this.startDate(), this.endDate())
      .pipe(
        finalize(() => {
          this.generatingExcel.set(false);
        }),
      )
      .subscribe({
        next: (file) => {
          this.downloadFile(
            file,
            'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
            'reporte-menu.xlsx',
          );

          bootstrap.Modal.getInstance(document.getElementById('exportSummaryModal')!)?.hide();
        },
        error: () => {
          console.error('No se pudo generar el Excel');
        },
      });
  }

  private downloadFile(file: BlobPart, mimeType: string, fileName: string): void {
    const blob = new Blob([file], { type: mimeType });

    const url = window.URL.createObjectURL(blob);

    const a = document.createElement('a');
    a.href = url;
    a.download = fileName;
    a.click();

    window.URL.revokeObjectURL(url);
  }

  private getPeruEndOfYear(): string {
    const year = new Intl.DateTimeFormat('en', {
      timeZone: 'America/Lima',
      year: 'numeric',
    }).format(new Date());

    return `${year}-12-31`;
  }

  private getPeruStartOfYear(): string {
    return `2026-01-01`;
  }
}
