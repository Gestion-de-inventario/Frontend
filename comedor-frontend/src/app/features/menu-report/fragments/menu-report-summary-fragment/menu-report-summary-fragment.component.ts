import { Component, OnInit, inject, signal } from '@angular/core';
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
export class MenuReportSummaryFragmentComponent implements OnInit {
  private readonly menuReportService = inject(MenuReportApiService);
  private readonly menuReportState = inject(MenuReportStateService);

  readonly report = this.menuReportState.report;
  summary = signal<MenuReportSummaryResponse | null>(null);
  loadingSummary = signal(false);

  ngOnInit(): void {
    this.loadSummary();
  }

  loadSummary(): void {
    const report = this.report();
    if (!report) return;
    this.loadingSummary.set(true);

    this.menuReportService.getSummary(report.id).subscribe({
      next: (summary) => {
        this.summary.set(summary);
        this.loadingSummary.set(false);
      },
      error: () => {
        this.loadingSummary.set(false);
      },
    });
  }
}