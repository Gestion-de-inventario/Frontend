import { Component, computed, inject, ChangeDetectorRef, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { TransactionService } from '@features/transactions_modifications/services/transactions/transaction-api.service';
import { TransactionStateService } from '@features/transactions_modifications/services/transactions/transaction-state.service';
import { TransactionsResponse } from '@features/transactions_modifications/interfaces/transactions/transactions.response';
import { AuthStateService } from '@core/auth/services/auth-state.service';
import { ToastService } from '@shared/services/toast.service';
import { finalize } from 'rxjs/operators';
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

  errorMessage = signal<string | null>(null);

  minDate = signal<string>(this.getPeruStartOfYear());

  maxDate = signal<string>(this.getPeruEndOfYear());

  constructor() {
    if (!this.canList) return;
    this.loadTransactions();
  }

  readonly isCustomDateRangeInvalid = computed(() => {
    if (this.filterOption() !== 'custom') return false;

    const start = this.customStartDate();
    const end = this.customEndDate();

    if (!start || !end) return true;

    return start > end;
  });

  // =========================
  // LOGICA DE FILTROS Y PDF
  // =========================

  onFilterChange() {
    if (this.filterOption() !== 'custom') {
      this.applyFilters();
    }
  }
  applyFilters(): void {
    if (this.isCustomDateRangeInvalid()) {
      this.errorMessage.set(
        'Selecciona una fecha de inicio y una fecha fin válidas para el rango personalizado.',
      );
      return;
    }

    this.errorMessage.set(null);
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
          start: this.customStartDate() || this.formatLocalDate(now),
          end: this.customEndDate() || this.formatLocalDate(now),
        };
    }

    return {
      start: this.formatLocalDate(start),
      end: this.formatLocalDate(end),
    };
  }

  exportToPdf(): void {
    if (this.exporting() || this.isCustomDateRangeInvalid()) {
      this.errorMessage.set('Corrige el rango de fechas antes de exportar el PDF.');
      return;
    }

    this.errorMessage.set(null);
    this.exporting.set(true);

    const { start, end } = this.calculateDates(this.filterOption());

    this.transactionService
      .exportPdf(start, end)
      .pipe(finalize(() => this.exporting.set(false)))
      .subscribe({
        next: (blob: Blob) => {
          const url = window.URL.createObjectURL(blob);
          const a = document.createElement('a');

          a.href = url;
          a.download = `transacciones_${start}_al_${end}.pdf`;

          document.body.appendChild(a);
          a.click();
          document.body.removeChild(a);

          window.URL.revokeObjectURL(url);

          this.toastService.show('PDF exportado correctamente', 'success');
        },

        error: () => {
          this.errorMessage.set('No se pudo exportar el PDF. Inténtalo nuevamente.');
          this.toastService.show('Error al exportar PDF', 'danger');
        },
      });
  }

  sourceOptions = computed(() => {
    switch (this.type()) {
      case 'ENTRADA':
        return [
          { value: 'COMPRA', label: 'Compra' },
          { value: 'DONACION', label: 'Donación' },
          { value: 'TRANSFERENCIA', label: 'Transferencia' },
        ];

      case 'SALIDA':
        return [{ value: 'INVENTARIO', label: 'Inventario' }];

      default:
        return [
          { value: 'COMPRA', label: 'Compra' },
          { value: 'DONACION', label: 'Donación' },
          { value: 'TRANSFERENCIA', label: 'Transferencia' },
          { value: 'INVENTARIO', label: 'Inventario' },
        ];
    }
  });

  onTypeChange(type: string | null): void {
    this.type.set(type);

    const validSources = this.sourceOptions().map((s) => s.value);

    if (this.source() && !validSources.includes(this.source()!)) {
      this.source.set(null);
    }

    this.applyFilters();
  }

  clearFilters(): void {
    this.filterOption.set('este_mes');
    this.type.set(null);
    this.source.set(null);
    this.name.set('');
    this.customStartDate.set('');
    this.customEndDate.set('');
    this.page.set(0);
    this.loadTransactions();
  }

  // =========================
  // CARGA Y PAGINACIÓN
  // =========================

  loadTransactions(): void {
    this.errorMessage.set(null);
    this.loading.set(true);

    const q = this.buildQuery();

    this.transactionService
      .getTransactions(q.page, q.size, q.start, q.end, q.type, q.source, q.name)
      .pipe(finalize(() => this.loading.set(false)))
      .subscribe({
        next: (response) => {
          this.transactionState.set(response.content);
          this.totalPages.set(response.totalPages);
          this.totalElements.set(response.totalElements);
          this.page.set(response.number);
        },

        error: () => {
          this.transactionState.set([]);
          this.errorMessage.set(
            'No se pudieron cargar las transacciones. Verifica los filtros o tu conexión e inténtalo nuevamente.',
          );
          this.toastService.show('Error al cargar transacciones', 'danger');
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

  private formatLocalDate(date: Date): string {
    return (
      date.getFullYear() +
      '-' +
      String(date.getMonth() + 1).padStart(2, '0') +
      '-' +
      String(date.getDate()).padStart(2, '0')
    );
  }

  private getPeruEndOfYear(): string {
    const year = new Intl.DateTimeFormat('en', {
      timeZone: 'America/Lima',
      year: 'numeric',
    }).format(new Date());

    return `${year}-12-31`;
  }

  private getPeruStartOfYear(): string {
    return `2026-01-01`;
  }
}
