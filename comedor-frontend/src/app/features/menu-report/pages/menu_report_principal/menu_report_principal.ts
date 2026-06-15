import { Component, inject } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { AuthStateService } from '@core/auth/services/auth-state.service';
@Component({
  selector: 'app-menu-report-principal',
  standalone: true,
  imports: [RouterOutlet],
  templateUrl: './menu_report_principal.html',
  styleUrl: './menu_report_principal.scss',
})
export class MenuReportPrincipal {
  readonly authState = inject(AuthStateService);

  canAccess =
    this.authState.hasPermission('MENU_REPORT_CREATE_REPORT') ||
    this.authState.hasPermission('MENU_REPORT_LIST_ALL');
}
