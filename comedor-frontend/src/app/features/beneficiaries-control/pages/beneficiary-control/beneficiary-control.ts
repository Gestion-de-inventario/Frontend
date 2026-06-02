import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MenuReportBeneficiariesFragmentComponent } from '@features/beneficiaries-control/fragments/menu-report-beneficiaries-fragment/menu-report-beneficiaries-fragment.component';
import { AuthStateService } from '@core/auth/services/auth-state.service';
@Component({
  selector: 'app-beneficiary-control',
  imports: [CommonModule, MenuReportBeneficiariesFragmentComponent],
  templateUrl: './beneficiary-control.html',
  styleUrl: './beneficiary-control.scss',
})
export class BeneficiaryControl {
  readonly authState = inject(AuthStateService);

  readonly canAdd = this.authState.hasPermission('MENU_REPORT_ADD_BENEFICIARY');
}
