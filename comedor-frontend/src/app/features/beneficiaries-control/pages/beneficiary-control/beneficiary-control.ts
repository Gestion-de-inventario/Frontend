import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AuthStateService } from '@core/auth/services/auth-state.service';
import { RouterOutlet } from '@angular/router';
@Component({
  selector: 'app-beneficiary-control',
  imports: [CommonModule, RouterOutlet],
  templateUrl: './beneficiary-control.html',
  styleUrl: './beneficiary-control.scss',
})
export class BeneficiaryControl {
  readonly authState = inject(AuthStateService);

  canAccess =
    this.authState.hasPermission('MENU_REPORT_ADD_BENEFICIARY') ||
    this.authState.hasPermission('MENU_REPORT_LIST_ALL');
}
