import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';

import { AuthStateService } from '@core/auth/services/auth-state.service';

import { TransactionsFragmentComponent } from '@features/transactions_modifications/fragments/transactions-fragment/transactions-fragment.component';
import { ModificationsFragmentComponent } from '@features/transactions_modifications/fragments/modifications-fragment/modifications-fragment.component';

@Component({
  selector: 'app-transactions-modifications-principal',

  standalone: true,

  imports: [
    CommonModule,
    RouterModule,
    TransactionsFragmentComponent,
    ModificationsFragmentComponent,
  ],

  templateUrl: './transactions-modifications-principal.component.html',
  styleUrls: ['./transactions-modifications-principal.component.scss'],
})
export class TransactionsModificationsPrincipalComponent {
  readonly authState = inject(AuthStateService);

  canViewTransactions = this.authState.hasPermission('TRANSACTION_LIST_ALL');

  canViewModifications = this.authState.hasPermission('MODIFICATION_LIST_ALL');
}
