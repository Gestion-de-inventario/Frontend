import { Component, computed, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MenuReportApiService } from '@features/menu-report/services/menu-report-api.service';
import { BeneficiaryControlApiService } from '@features/beneficiaries-control/services/beneficiaries-control-api.service';
import { MenuReportStateService } from '@features/menu-report/services/menu-report-state.service';
import { AuthStateService } from '@core/auth/services/auth-state.service';
import { BeneficiaryApiService } from '@features/beneficiaries/services/beneficiary-api.service';
import { BeneficiaryStateService } from '@features/beneficiaries/services/beneficiary-state.service';
import { BeneficiaryResponse } from '@features/beneficiaries/interfaces/beneficiary.response';
import { BeneficiaryRecordResponse } from '@features/beneficiaries-control/interfaces/beneficiary-record-response';
import { ToastService } from '@shared/services/toast.service';
import { Router } from '@angular/router';
import { finalize } from 'rxjs/internal/operators/finalize';

declare const bootstrap: any;

const LocalToday = new Date();

const localDate =
  LocalToday.getFullYear() +
  '-' +
  String(LocalToday.getMonth() + 1).padStart(2, '0') +
  '-' +
  String(LocalToday.getDate()).padStart(2, '0');

@Component({
  selector: 'app-menu-report-beneficiaries-fragment',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './menu-report-beneficiaries-fragment.component.html',
})
export class MenuReportBeneficiariesFragmentComponent {
  private readonly beneficiaryControlService = inject(BeneficiaryControlApiService);
  private readonly menuReportService = inject(MenuReportApiService);
  private readonly menuReportState = inject(MenuReportStateService);
  private readonly beneficiaryService = inject(BeneficiaryApiService);
  private readonly beneficiaryState = inject(BeneficiaryStateService);
  private readonly toastService = inject(ToastService);
  readonly authState = inject(AuthStateService);
  private readonly router = inject(Router);

  public readonly localDate = localDate;

  readonly report = this.menuReportState.report;

  beneficiarySearch = signal('');
  menusAmount = signal<number | null>(null);
  menuPrice = signal<number | null>(null);
  payMethod = signal<'EFECTIVO' | 'YAPE' | 'PLIN'>('EFECTIVO');
  pago = signal(false);
  entregado = signal(false);
  selectedBeneficiary: BeneficiaryResponse | null = null;
  editingRecord: BeneficiaryRecordResponse | null = null;
  beneficiaryToDelete: BeneficiaryRecordResponse | null = null;
  deletingLoading = signal(false);
  loading = signal(false);
  loadingReport = signal(false);

  listLoading = signal(false);

  ngOnInit(): void {
    this.initReport();
  }

  initReport(): void {
    const cached = this.report();

    if (cached) return;

    this.loadingReport.set(true);

    this.menuReportState.getOrLoadTodayReport(localDate).subscribe({
      next: () => {
        this.loadingReport.set(false);
      },
      error: () => {
        this.loadingReport.set(false);
        this.toastService.show('No se pudo cargar el reporte del día', 'danger');
      },
    });
  }

  readonly allBeneficiaries = this.beneficiaryState.beneficiaries;

  readonly filteredBeneficiaries = computed(() => {
    const term = this.beneficiarySearch().toLowerCase();
    if (!term) return [];
    return this.allBeneficiaries().filter(
      (b) =>
        b.status === 'ACTIVO' &&
        (`${b.name} ${b.lastname}`.toLowerCase().includes(term) || b.dni.includes(term)),
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

  openDeleteModal(record: BeneficiaryRecordResponse): void {
    this.beneficiaryToDelete = record;
    const modal = new bootstrap.Modal(document.getElementById('deleteBeneficiaryModal'));
    modal.show();
  }

  selectBeneficiary(beneficiary: BeneficiaryResponse): void {
    this.selectedBeneficiary = beneficiary;

    this.menuPrice.set(beneficiary.menu_cost);

    this.beneficiarySearch.set('');
  }

  navigateToCreateReport(): void {
    this.router.navigate(['/menu-report']);
  }

  saveBeneficiary(): void {
    const report = this.report();

    if (!report || this.loading()) return;
    if (!this.editingRecord && !this.selectedBeneficiary) return;
    if (!this.menusAmount()) return;

    this.loading.set(true);

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
      ? this.beneficiaryControlService.editBeneficiary(
          report.id,
          this.getBeneficiaryControlId(),
          request,
        )
      : this.beneficiaryControlService.addBeneficiary(report.id, request);

    call
      .pipe(
        finalize(() => {
          this.loading.set(false);
        }),
      )
      .subscribe({
        next: () => {
          this.toastService.show(
            this.editingRecord ? 'Beneficiario actualizado' : 'Beneficiario agregado',
            'success',
          );
          this.reloadReport();
          bootstrap.Modal.getInstance(document.getElementById('beneficiaryRecordModal')!)?.hide();
          this.resetForm();
          this.loading.set(false);
        },
        error: (error) => {
          this.toastService.show('Error: ' + error.error.message, 'danger');
          this.loading.set(false);
        },
        complete: () => {
          this.loading.set(false);
        },
      });
  }

  cancelDelete(): void {
    this.beneficiaryToDelete = null;
    bootstrap.Modal.getInstance(document.getElementById('deleteBeneficiaryModal')!)?.hide();
  }

  removeBeneficiary(record: BeneficiaryRecordResponse): void {
    this.openDeleteModal(record);
  }

  confirmRemoveBeneficiary(): void {
    const report = this.report();
    if (!report || !this.beneficiaryToDelete) return;

    this.deletingLoading.set(true);

    this.beneficiaryControlService
      .removeBeneficiary(report.id, this.beneficiaryToDelete.id)
      .pipe(
        finalize(() => {
          this.deletingLoading.set(false);
        }),
      )
      .subscribe({
        next: () => {
          this.toastService.show('Registro eliminado', 'warning');
          bootstrap.Modal.getInstance(document.getElementById('deleteBeneficiaryModal')!)?.hide();
          this.beneficiaryToDelete = null;
          this.reloadReport();
        },
        error: (error) => {
          this.toastService.show('Error: ' + error.error.message, 'danger');
          this.deletingLoading.set(false);
        },
      });
  }

  getBeneficiaryControlId(record?: BeneficiaryRecordResponse): number {
    const target = record || this.editingRecord;
    if (!target) throw new Error('No se ha seleccionado un beneficiario');
    return target.id;
  }

  reloadReport(): void {
    const date = this.report()!.date;

    this.listLoading.set(true);

    this.menuReportService
      .getByDate(date)
      .pipe(
        finalize(() => {
          this.listLoading.set(false);
        }),
      )
      .subscribe({
        next: (report) => {
          this.menuReportState.setReport(report);
        },
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
