import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';

import { TransactionService } from '@features/transactions_modifications/services/transactions/transaction-api.service';
import { TransactionsResponse } from '@features/transactions_modifications/interfaces/transactions/transactions.response';

import { ToastService } from '@shared/services/toast.service';

declare const bootstrap: any;

@Component({
  selector: 'app-transactions-fragment',

  standalone: true,

  imports: [CommonModule],

  templateUrl: './transactions-fragment.component.html',
  styleUrls: ['./transactions-fragment.component.scss'],
})
export class TransactionsFragmentComponent {
  private readonly transactionService = inject(TransactionService);
  private readonly toastService = inject(ToastService);

  transactions: TransactionsResponse[] = [];

  // modal pagination
  modalTransactions: TransactionsResponse[] = [];

  page = 0;
  size = 5;

  modalPage = 0;
  modalSize = 10;

  totalPages = 0;

  loading = false;

  constructor() {
    this.loadInitial();
  }

  // =========================
  // LISTADO PRINCIPAL (5)
  // =========================
  loadInitial(): void {
    this.transactionService.list(this.page, this.size).subscribe({
      next: (res: any) => {
        this.transactions = res.content;
        this.totalPages = res.totalPages;
      },
    });
  }

  // =========================
  // ABRIR MODAL
  // =========================
  openModal(): void {
    this.modalPage = 0;
    this.modalTransactions = [];

    this.loadModalPage();

    const modal = new bootstrap.Modal(document.getElementById('transactionsModal'));

    modal.show();
  }

  // =========================
  // CARGAR PAGINA MODAL (10)
  // =========================
  loadModalPage(): void {
    this.loading = true;

    this.transactionService.list(this.modalPage, this.modalSize).subscribe({
      next: (res: any) => {
        this.modalTransactions = [...this.modalTransactions, ...res.content];
      },
      complete: () => {
        this.loading = false;
      },
    });
  }

  nextPage(): void {
    this.modalPage++;
    this.loadModalPage();
  }

  hasMore(): boolean {
    return this.modalTransactions.length % this.modalSize === 0;
  }
}
