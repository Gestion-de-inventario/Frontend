import { Component, inject } from '@angular/core';
import { RouterLink } from '@angular/router';
import { AuthStateService } from '@core/auth/services/auth-state.service';
import { BeneficiaryListFragmentComponent } from '@features/beneficiaries/fragments/beneficiary-list-fragment/beneficiary-list-fragment.component';
import { BeneficiaryCreateFragmentComponent } from '@features/beneficiaries/fragments/beneficiary-create-fragment/beneficiary-create-fragment.component';

@Component({
  selector: 'app-beneficiary-principal',
  standalone: true,
  imports: [RouterLink, BeneficiaryListFragmentComponent, BeneficiaryCreateFragmentComponent],
  templateUrl: './beneficiary_principal.html',
  styleUrl: './beneficiary_principal.scss',
})
export class BeneficiaryPrincipal {
  readonly authState = inject(AuthStateService);

  readonly canList = this.authState.hasPermission('BENEFICIARY_LIST_BY_STATUS');
  readonly canCreate = this.authState.hasPermission('BENEFICIARY_CREATE');
}