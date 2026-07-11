import { Component, computed, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ModificationsService } from '@features/transactions_modifications/services/modification/modifications-api.service';
import { ModificationsStateService } from '@features/transactions_modifications/services/modification/modifications-state.service';
import { ModificationsResponse } from '@features/transactions_modifications/interfaces/modifications/modifications.response';
import { AuthStateService } from '@core/auth/services/auth-state.service';
import { ToastService } from '@shared/services/toast.service';

declare const bootstrap: any;

@Component({
  selector: 'app-modifications-fragment',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './modifications-fragment.component.html',
  styleUrls: ['./modifications-fragment.component.scss'],
})
export class ModificationsFragmentComponent {
  readonly authState = inject(AuthStateService);
  private readonly modificationsService = inject(ModificationsService);
  private readonly modificationsState = inject(ModificationsStateService);
  private readonly toastService = inject(ToastService);

  canList = this.authState.hasPermission('MODIFICATION_LIST_ALL');
  readonly modifications = computed(() => this.modificationsState.modifications());
  modalModifications: ModificationsResponse[] = [];

  loading = signal<boolean>(false);
  exporting = signal<boolean>(false);

  modalPage = 0;
  modalSize = 10;
  pageSize = signal(3);
  page = signal(0);
  totalPages = signal(0);
  totalElements = signal(0);

  filterOption = signal<string>('este_mes');
  customStartDate = signal<string>('');
  customEndDate = signal<string>('');

  constructor() {
    if (!this.canList) return;
    this.loadModifications();
  }

  // =========================
  // LOGICA DE FILTROS Y PDF
  // =========================

  onFilterChange() {
    if (this.filterOption() !== 'custom') {
      this.page.set(0);
      this.loadModifications();
    }
  }

  onCustomDateChange() {
    if (this.customStartDate() && this.customEndDate()) {
      this.page.set(0);
      this.loadModifications();
    }
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

  exportToPdf() {
    this.exporting.set(true);
    const { start, end } = this.calculateDates(this.filterOption());

    this.modificationsService.exportPdf(start, end).subscribe({
      next: (blob: Blob) => {
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        const fileName =
          start && end ? `modificaciones_${start}_al_${end}.pdf` : `modificaciones_historico.pdf`;
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

  loadModifications(): void {
    this.loading.set(true);
    const { start, end } = this.calculateDates(this.filterOption());

    this.modificationsService.getModifications(this.page(), this.pageSize(), start, end).subscribe({
      next: (response) => {
        this.modificationsState.set(response.content);
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

  nextPage(): void {
    if (this.page() + 1 < this.totalPages()) {
      this.page.update((v) => v + 1);
      this.loadModifications();
    }
  }

  previousPage(): void {
    if (this.page() > 0) {
      this.page.update((v) => v - 1);
      this.loadModifications();
    }
  }

  changePageSize(size: number): void {
    this.pageSize.set(size);
    this.page.set(0);
    this.loadModifications();
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
}
