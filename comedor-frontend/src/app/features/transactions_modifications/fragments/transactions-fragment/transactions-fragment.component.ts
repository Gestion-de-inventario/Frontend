import { Component, computed, inject, ChangeDetectorRef, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { TransactionService } from '@features/transactions_modifications/services/transactions/transaction-api.service';
import { TransactionStateService } from '@features/transactions_modifications/services/transactions/transaction-state.service';
import { TransactionsResponse } from '@features/transactions_modifications/interfaces/transactions/transactions.response';
import { AuthStateService } from '@core/auth/services/auth-state.service';
import { ToastService } from '@shared/services/toast.service';

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
  private readonly toastService = inject(ToastService); // Inyectamos para las alertas del PDF

  readonly transactions = computed(() => this.transactionState.transactions());

  canList = this.authState.hasPermission('TRANSACTION_LIST_ALL');

  modalTransactions: TransactionsResponse[] = [];

  loading = signal<boolean>(false);
  exporting = signal<boolean>(false); // Signal para el botón de PDF

  modalPage = 0;
  modalSize = 10;
  pageSize = signal(3);
  page = signal(0);
  totalPages = signal(0);
  totalElements = signal(0);

  // Signals para Filtros de Fecha
  filterOption = signal<string>('este_mes'); // Por defecto 'este mes'
  customStartDate = signal<string>('');
  customEndDate = signal<string>('');
  type = signal<string | null>(null);
  source = signal<string | null>(null);
  name = signal<string>('');

  constructor() {
    if (!this.canList) return;
    this.loadTransactions();
  }

  // =========================
  // LOGICA DE FILTROS Y PDF
  // =========================

  onFilterChange() {
    if (this.filterOption() !== 'custom') {
      this.applyFilters();
    }
  }
  applyFilters(): void {
    this.page.set(0);
    this.loadTransactions();
  }

  onCustomDateChange() {
    if (this.customStartDate() && this.customEndDate()) {
      this.applyFilters();
    }
  }

  private buildQuery() {
    const { start, end } = this.calculateDates(this.filterOption());

    return {
      page: this.page(),
      size: this.pageSize(),
      start,
      end,
      type: this.type() ?? undefined,
      source: this.source() ?? undefined,
      name: this.name() || undefined,
    };
  }

  private calculateDates(option: string): { start: string; end: string } {
    const now = new Date();
    let start = new Date();
    let end = new Date();
    const formatDate = (d: Date) => d.toISOString().split('T')[0];

    switch (option) {
      case 'hoy':
        break;
      case 'ayer':
        start.setDate(now.getDate() - 1);
        end.setDate(now.getDate() - 1);
        break;
      case 'esta_semana':
        const firstDay = now.getDate() - now.getDay() + (now.getDay() === 0 ? -6 : 1);
        start.setDate(firstDay);
        break;
      case 'este_mes':
        start = new Date(now.getFullYear(), now.getMonth(), 1);
        break;
      case 'mes_pasado':
        start = new Date(now.getFullYear(), now.getMonth() - 1, 1);
        end = new Date(now.getFullYear(), now.getMonth(), 0);
        break;
      case 'custom':
        return {
          start: this.customStartDate() || formatDate(new Date()),
          end: this.customEndDate() || formatDate(new Date()),
        };
    }
    return { start: formatDate(start), end: formatDate(end) };
  }

  exportToPdf() {
    this.exporting.set(true);
    const { start, end } = this.calculateDates(this.filterOption());

    this.transactionService.exportPdf(start, end).subscribe({
      next: (blob: Blob) => {
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        const fileName =
          start && end ? `transacciones_${start}_al_${end}.pdf` : `transacciones_historico.pdf`;
        a.download = fileName;

        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        window.URL.revokeObjectURL(url);

        this.toastService.show('PDF exportado correctamente', 'success');
      },
      error: () => this.toastService.show('Error al exportar PDF', 'danger'),
      complete: () => this.exporting.set(false),
    });
  }

  // =========================
  // CARGA Y PAGINACIÓN
  // =========================

  loadTransactions(): void {
    this.loading.set(true);

    const q = this.buildQuery();

    this.transactionService
      .getTransactions(q.page, q.size, q.start, q.end, q.type, q.source, q.name)
      .subscribe({
        next: (response) => {
          this.transactionState.set(response.content);

          this.totalPages.set(response.totalPages);
          this.totalElements.set(response.totalElements);

          this.page.set(response.number);
        },

        error: () => {
          this.toastService.show('Error al cargar transacciones', 'danger');
          this.loading.set(false);
        },

        complete: () => {
          this.loading.set(false);
        },
      });
  }

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
