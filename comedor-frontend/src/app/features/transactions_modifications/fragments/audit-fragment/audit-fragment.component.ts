import { Component, computed, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { AuditsService } from '@features/transactions_modifications/services/audits/audits-api.service';
import { AuditsStateService } from '@features/transactions_modifications/services/audits/audits-state.service';
import {
  AuditAction,
  AuditsResponse,
} from '@features/transactions_modifications/interfaces/audits/audits.response';
import { AuthStateService } from '@core/auth/services/auth-state.service';
import { ToastService } from '@shared/services/toast.service';

interface AuditSupply {
  producto: string;
  cantidad: number | string;
  unidad?: string;
}

@Component({
  selector: 'app-audit-fragment',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './audit-fragment.component.html',
  styleUrls: ['./audit-fragment.component.scss'],
})
export class AuditFragmentComponent {
  readonly authState = inject(AuthStateService);
  private readonly auditsService = inject(AuditsService);
  private readonly auditsState = inject(AuditsStateService);
  private readonly toastService = inject(ToastService);

  canList = this.authState.hasPermission('AUDIT_LIST_ALL');
  readonly audits = computed(() => this.auditsState.audits());
  readonly AuditAction = AuditAction;

  modalAudits: AuditsResponse[] = [];

  loading = signal<boolean>(false);
  exporting = signal<boolean>(false);

  pageSize = signal(3);
  page = signal(0);
  totalPages = signal(0);
  totalElements = signal(0);

  filterOption = signal<string>('este_mes');
  customStartDate = signal<string>('');
  customEndDate = signal<string>('');

  action = signal<string>('');

  constructor() {
    if (!this.canList) return;
    this.loadAudits();
  }

  // =========================
  // LOGICA DE FILTROS Y PDF
  // =========================

  onFilterChange() {
    if (this.filterOption() !== 'custom') {
      this.page.set(0);
      this.loadAudits();
    }
  }

  onActionChange(): void {
    this.page.set(0);
    this.loadAudits();
  }

  onCustomDateChange() {
    if (this.customStartDate() && this.customEndDate()) {
      this.page.set(0);
      this.loadAudits();
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

    this.auditsService.exportPdf(start, end).subscribe({
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

  loadAudits(): void {
    this.loading.set(true);
    const start = this.customStartDate() || undefined;
    const end = this.customEndDate() || undefined;
    const action = this.action() || undefined;

    this.auditsService.getAudits(this.page(), this.pageSize(), start, end, action).subscribe({
      next: (response) => {
        this.auditsState.set(response.content);
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
      this.loadAudits();
    }
  }

  previousPage(): void {
    if (this.page() > 0) {
      this.page.update((v) => v - 1);
      this.loadAudits();
    }
  }

  changePageSize(size: number): void {
    this.pageSize.set(size);
    this.page.set(0);
    this.loadAudits();
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

  getDetailEntries(details: Record<string, unknown>): [string, unknown][] {
    return Object.entries(details);
  }

  formatDetailLabel(key: string): string {
    const labels: Record<string, string> = {
      status: 'Estado',
      estado: 'Estado',
      name: 'Nombre',
      nombre: 'Nombre',
      supplies: 'Insumos',
      insumos: 'Insumos',
      description: 'Descripción',
      descripcion: 'Descripción',
      attribute: 'Campo modificado',
      previousValue: 'Valor anterior',
      newValue: 'Valor nuevo',
    };

    return labels[key] ?? key.replace(/([a-z])([A-Z])/g, '$1 $2');
  }

  isSupplyList(value: unknown): boolean {
    const parsed = this.parseStructuredValue(value);
    return (
      Array.isArray(parsed) &&
      parsed.length > 0 &&
      parsed.every(
        (item) =>
          typeof item === 'object' && item !== null && 'producto' in item && 'cantidad' in item,
      )
    );
  }

  getSupplies(value: unknown): AuditSupply[] {
    return this.isSupplyList(value) ? (this.parseStructuredValue(value) as AuditSupply[]) : [];
  }

  formatQuantity(value: number | string): string {
    const quantity = Number(value);
    return Number.isFinite(quantity)
      ? new Intl.NumberFormat('es-PE', { maximumFractionDigits: 3 }).format(quantity)
      : String(value);
  }

  formatDetailValue(value: unknown): string {
    if (value === null || value === undefined || value === '') {
      return 'Sin valor';
    }

    if (Array.isArray(value)) {
      return value
        .map((item) => {
          if (typeof item === 'object' && item !== null) {
            return JSON.stringify(item);
          }

          return String(item);
        })
        .join(', ');
    }

    if (typeof value === 'object') {
      return JSON.stringify(value);
    }

    return String(value);
  }

  private parseStructuredValue(value: unknown): unknown {
    if (typeof value !== 'string') return value;

    const trimmed = value.trim();
    if (!trimmed.startsWith('[') && !trimmed.startsWith('{')) return value;

    try {
      return JSON.parse(trimmed);
    } catch {
      return value;
    }
  }
}
