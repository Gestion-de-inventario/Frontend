import { Component, inject } from '@angular/core';
import { AuthStateService } from '@core/auth/services/auth-state.service';
import { BeneficiaryTypeCreateFragmentComponent } from '@features/beneficiaryType/fragments/create-fragment/beneficiary-type-create-fragment.component';
import { BeneficiaryTypeListFragmentComponent } from '@features/beneficiaryType/fragments/list-fragment/beneficiaryType-list-fragment';
@Component({
  selector: 'app-beneficiary-type-principal',
  standalone: true,
  imports: [BeneficiaryTypeCreateFragmentComponent, BeneficiaryTypeListFragmentComponent],
  templateUrl: './beneficiary-type-principal.html',
  styleUrl: './beneficiary-type-principal.scss',
})
export class BeneficiaryTypePrincipal {
  readonly authState = inject(AuthStateService);

  readonly canList = this.authState.hasPermission('BENEFICIARY_TYPE_LIST_BY_STATUS');
  readonly canCreate = this.authState.hasPermission('BENEFICIARY_TYPE_CREATE');
}
