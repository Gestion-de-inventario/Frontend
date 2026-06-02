import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MenuReportSummaryFragmentComponent } from '../fragments/menu-report-summary-fragment/menu-report-summary-fragment.component';
import { AuthStateService } from '@core/auth/services/auth-state.service';
import { inject } from '@angular/core';
@Component({
  selector: 'app-menu-report-summary',
  imports: [MenuReportSummaryFragmentComponent],
  templateUrl: './menu-report-summary.html',
  styleUrl: './menu-report-summary.scss',
})
export class MenuReportSummary {
  readonly authState = inject(AuthStateService);
  readonly canGetResumen = this.authState.hasPermission('MENU_REPORT_GET_SUMMARY');
}
