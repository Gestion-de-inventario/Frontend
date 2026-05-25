import { Component, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MenuReportApiService } from '@features/menu-report/services/menu-report-api.service';
import { MenuReportStateService } from '@features/menu-report/services/menu-report-state.service';
import { MenuReportSummaryResponse } from '@features/menu-report/interfaces/menu-report.response';

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
  summary = signal<MenuReportSummaryResponse | null>(null);
  loadingSummary = false;

  loadSummary(): void {
    const report = this.report();
    if (!report) return;
    this.loadingSummary = true;

    this.menuReportService.getSummary(report.id).subscribe({
      next: (summary) => {
        this.summary.set(summary);
        this.loadingSummary = false;
      },
      error: () => {
        this.loadingSummary = false;
      },
    });
  }
}