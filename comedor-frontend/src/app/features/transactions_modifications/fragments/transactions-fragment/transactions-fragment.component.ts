import { Component, computed, inject, ChangeDetectorRef } from '@angular/core';

import { CommonModule } from '@angular/common';

import { OnInit } from '@angular/core';

import { TransactionService } from '@features/transactions_modifications/services/transactions/transaction-api.service';

import { TransactionStateService } from '@features/transactions_modifications/services/transactions/transaction-state.service';

import { TransactionsResponse } from '@features/transactions_modifications/interfaces/transactions/transactions.response';

declare const bootstrap: any;

@Component({
  selector: 'app-transactions-fragment',

  standalone: true,

  imports: [CommonModule],

  templateUrl: './transactions-fragment.component.html',
})
export class TransactionsFragmentComponent implements OnInit {
  private readonly transactionService = inject(TransactionService);

  private readonly cdr = inject(ChangeDetectorRef);

  private readonly transactionState = inject(TransactionStateService);

  readonly transactions = computed(() => this.transactionState.transactions());

  modalTransactions: TransactionsResponse[] = [];

  loading = false;

  modalPage = 0;

  modalSize = 10;

  ngOnInit(): void {
    this.loadPreview();
  }
  // =========================
  // PREVIEW
  // =========================

  loadPreview(): void {
    this.loading = true;
    this.transactionService.list(0, 3).subscribe({
      next: (data) => {
        this.transactionState.set(data.content);
        this.loading = false;
        this.cdr.detectChanges();
      },
      error: () => {
        this.loading = false;
        this.cdr.detectChanges();
      },
    });
  }

  // =========================
  // MODAL
  // =========================

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

  nextPage(): void {
    if (this.loading) {
      return;
    }

    this.modalPage++;

    this.loadModalPage();
  }

  hasMore(): boolean {
    return this.modalTransactions.length % this.modalSize === 0;
  }
}
