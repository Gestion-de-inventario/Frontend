import { Component, computed, inject, ChangeDetectorRef, signal } from '@angular/core';

import { CommonModule } from '@angular/common';

import { TransactionService } from '@features/transactions_modifications/services/transactions/transaction-api.service';

import { TransactionStateService } from '@features/transactions_modifications/services/transactions/transaction-state.service';

import { TransactionsResponse } from '@features/transactions_modifications/interfaces/transactions/transactions.response';
import { FormsModule } from '@angular/forms';
import { AuthStateService } from '@core/auth/services/auth-state.service';

declare const bootstrap: any;

@Component({
  selector: 'app-transactions-fragment',

  standalone: true,

  imports: [CommonModule, FormsModule],

  templateUrl: './transactions-fragment.component.html',
})
export class TransactionsFragmentComponent {
  readonly authState = inject(AuthStateService);

  private readonly transactionService = inject(TransactionService);

  private readonly transactionState = inject(TransactionStateService);

  readonly transactions = computed(() => this.transactionState.transactions());

  canList = this.authState.hasPermission('TRANSACTION_LIST_ALL');

  modalTransactions: TransactionsResponse[] = [];

  loading = signal<boolean>(false);

  modalPage = 0;

  modalSize = 10;

  pageSize = signal(3);

  page = signal(0);

  totalPages = signal(0);

  totalElements = signal(0);

  constructor() {
    if (!this.canList) return;

    this.loadTransactions();
  }

  loadTransactions(): void {
    this.loading.set(true);
    this.transactionService.list(this.page(), this.pageSize()).subscribe({
      next: (response) => {
        this.transactionState.set(response.content);

        this.totalPages.set(response.totalPages);

        this.totalElements.set(response.totalElements);

        this.loading.set(false);
      },
      error: () => {
        this.loading.set(false);
      },

      complete: () => {
        this.loading.set(false);
      },
    });
  }

  // =========================
  // MODAL
  // =========================
  /*
  openModal(): void {
    this.modalPage = 0;

    this.modalTransactions = [];

    this.loadModalPage();

    const modal = new bootstrap.Modal(document.getElementById('transactionsModal'));

    modal.show();
  }

  closeModal(): void {
    this.loading = false;
    this.modalTransactions = [];
    this.modalPage = 0;
  }

  loadModalPage(): void {
    this.loading = true;
    this.transactionService.list(this.modalPage, this.modalSize).subscribe({
      next: (data) => {
        this.modalTransactions = [...this.modalTransactions, ...data.content];
        this.loading = false;
        this.cdr.detectChanges();
      },
      error: () => {
        this.loading = false;
        this.cdr.detectChanges();
      },
    });
  } 
 */
  ////

  nextPage(): void {
    if (this.page() + 1 < this.totalPages()) {
      this.page.update((v) => v + 1);

      this.loadTransactions();
    }
  }

  previousPage(): void {
    if (this.page() > 0) {
      this.page.update((v) => v - 1);

      this.loadTransactions();
    }
  }

  changePageSize(size: number): void {
    this.pageSize.set(size);

    this.page.set(0);

    this.loadTransactions();
  }

  hasMore(): boolean {
    return this.modalTransactions.length % this.modalSize === 0;
  }
}
