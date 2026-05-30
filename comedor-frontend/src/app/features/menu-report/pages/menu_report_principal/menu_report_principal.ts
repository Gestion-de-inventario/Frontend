import { Component, inject } from '@angular/core';
import { RouterLink } from '@angular/router';
import { AuthStateService } from '@core/auth/services/auth-state.service';
import { MenuReportCreateFragmentComponent } from '@features/menu-report/fragments/menu-report-create-fragment/menu-report-create-fragment.component';

@Component({
  selector: 'app-menu-report-principal',
  standalone: true,
  imports: [RouterLink, MenuReportCreateFragmentComponent],
  templateUrl: './menu_report_principal.html',
  styleUrl: './menu_report_principal.scss',
})
export class MenuReportPrincipal {
  readonly authState = inject(AuthStateService);

  readonly canCreate = this.authState.hasPermission('MENU_REPORT_CREATE_REPORT');
  readonly canGetByDate = this.authState.hasPermission('MENU_REPORT_GET_BY_DATE');
}