import { Component, computed, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MenuReportApiService } from '@features/menu-report/services/menu-report-api.service';
import { MenuReportStateService } from '@features/menu-report/services/menu-report-state.service';
import { AuthStateService } from '@core/auth/services/auth-state.service';
import { BeneficiaryApiService } from '@features/beneficiaries/services/beneficiary-api.service';
import { BeneficiaryStateService } from '@features/beneficiaries/services/beneficiary-state.service';
import { BeneficiaryResponse } from '@features/beneficiaries/interfaces/beneficiary.response';
import { BeneficiaryRecordResponse } from '@features/menu-report/interfaces/menu-report.response';
import { ToastService } from '@shared/services/toast.service';

declare const bootstrap: any;

@Component({
  selector: 'app-menu-report-beneficiaries-fragment',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './menu-report-beneficiaries-fragment.component.html',
})
export class MenuReportBeneficiariesFragmentComponent {
  private readonly menuReportService = inject(MenuReportApiService);
  private readonly menuReportState = inject(MenuReportStateService);
  private readonly beneficiaryService = inject(BeneficiaryApiService);
  private readonly beneficiaryState = inject(BeneficiaryStateService);
  private readonly toastService = inject(ToastService);
  readonly authState = inject(AuthStateService);

  readonly report = this.menuReportState.report;

  beneficiarySearch = signal('');
  menusAmount = signal<number | null>(null);
  menuPrice = signal<number | null>(null);
  payMethod = signal<'EFECTIVO' | 'YAPE' | 'PLI'>('EFECTIVO');
  pago = signal(false);
  entregado = signal(false);
  selectedBeneficiary: BeneficiaryResponse | null = null;
  editingRecord: BeneficiaryRecordResponse | null = null;
  loading = false;

  readonly allBeneficiaries = this.beneficiaryState.beneficiaries;

  readonly filteredBeneficiaries = computed(() => {
    const term = this.beneficiarySearch().toLowerCase();
    if (!term) return [];
    return this.allBeneficiaries().filter(
      (b) =>
        b.status === 'ACTIVO' &&
        (`${b.name} ${b.lastname}`.toLowerCase().includes(term) || b.dni.includes(term))
    );
  });

  constructor() {
    this.beneficiaryService.listByStatus('ACTIVO').subscribe((list) => {
      this.beneficiaryState.setBeneficiaries(list);
    });
  }

  openAddModal(): void {
    this.resetForm();
    const modal = new bootstrap.Modal(document.getElementById('beneficiaryRecordModal'));
    modal.show();
  }

  openEditModal(record: BeneficiaryRecordResponse): void {
    this.editingRecord = record;
    this.menusAmount.set(record.cantidad);
    this.menuPrice.set(record.total / record.cantidad);
    this.payMethod.set(record.metodoPago);
    this.pago.set(record.pago);
    this.entregado.set(record.entregado);
    const modal = new bootstrap.Modal(document.getElementById('beneficiaryRecordModal'));
    modal.show();
  }

  selectBeneficiary(beneficiary: BeneficiaryResponse): void {
    this.selectedBeneficiary = beneficiary;
    this.beneficiarySearch.set('');
  }

  saveBeneficiary(): void {
    const report = this.report();
    if (!report || this.loading) return;
    if (!this.editingRecord && !this.selectedBeneficiary) return;
    if (!this.menusAmount()) return;

    this.loading = true;

    const request = {
      beneficiarioId: this.editingRecord
        ? 0 // no se usa en edit
        : this.selectedBeneficiary!.id,
      pago: this.pago(),
      entregado: this.entregado(),
      payMethod: this.payMethod(),
      menusAmount: this.menusAmount()!,
      menuPrice: this.menuPrice() ?? 0,
    };

    const call = this.editingRecord
      ? this.menuReportService.editBeneficiary(report.id, this.getBeneficiaryControlId(), request)
      : this.menuReportService.addBeneficiary(report.id, request);

    call.subscribe({
      next: () => {
        this.toastService.show(
          this.editingRecord ? 'Beneficiario actualizado' : 'Beneficiario agregado',
          'success'
        );
        this.reloadReport();
        bootstrap.Modal.getInstance(document.getElementById('beneficiaryRecordModal')!)?.hide();
        this.resetForm();
      },
      error: (error) => {
        this.toastService.show('Error: ' + error.error.message, 'danger');
        this.loading = false;
      },
      complete: () => {
        this.loading = false;
      },
    });
  }

  removeBeneficiary(record: BeneficiaryRecordResponse): void {
    const report = this.report();
    if (!report) return;

    this.menuReportService.removeBeneficiary(report.id, this.getBeneficiaryControlId(record)).subscribe({
      next: () => {
        this.toastService.show('Beneficiario eliminado', 'warning');
        this.reloadReport();
      },
      error: (error) => {
        this.toastService.show('Error: ' + error.error.message, 'danger');
      },
    });
  }

  getBeneficiaryControlId(record?: BeneficiaryRecordResponse): number {
    // necesitamos el controlId — pásame si el RegistroBeneficiarioResponseDTO tiene un id
    return 0;
  }

  reloadReport(): void {
    const date = this.report()!.date;
    this.menuReportService.getByDate(date).subscribe({
      next: (report) => this.menuReportState.setReport(report),
    });
  }

  resetForm(): void {
    this.selectedBeneficiary = null;
    this.editingRecord = null;
    this.beneficiarySearch.set('');
    this.menusAmount.set(null);
    this.menuPrice.set(null);
    this.payMethod.set('EFECTIVO');
    this.pago.set(false);
    this.entregado.set(false);
  }
}