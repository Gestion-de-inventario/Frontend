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
import { ActivatedRoute } from '@angular/router';
import { MenuReportResponse } from '@features/menu-report/interfaces/menu-report.response';
import { finalize } from 'rxjs';
import { SearchSelectComponent } from '@shared/components/search-select/search-select';

declare const bootstrap: any;

@Component({
  selector: 'app-menu-report-beneficiaries-fragment',
  standalone: true,
  imports: [CommonModule, FormsModule, SearchSelectComponent],
  templateUrl: './menu-report-beneficiaries-fragment.component.html',
})
export class MenuReportBeneficiariesFragmentComponent {
  private readonly route = inject(ActivatedRoute);
  private readonly beneficiaryControlService = inject(BeneficiaryControlApiService);
  private readonly menuReportService = inject(MenuReportApiService);
  readonly menuReportState = inject(MenuReportStateService);
  private readonly beneficiaryService = inject(BeneficiaryApiService);
  private readonly beneficiaryState = inject(BeneficiaryStateService);
  private readonly toastService = inject(ToastService);
  readonly authState = inject(AuthStateService);
  private readonly router = inject(Router);
  beneficiaryLabel = (b: BeneficiaryResponse) => `${b.name} ${b.lastname} - DNI: ${b.dni}`;

  report = signal<MenuReportResponse | null>(null);

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

  updatingBeneficiaryId = signal<number | null>(null);

  ngOnInit(): void {
    this.initReport();
  }

  initReport(): void {
    const id = Number(this.route.snapshot.paramMap.get('id'));
    const cached = this.menuReportState.selectedReport();
    if (cached && cached.id === id) {
      this.report.set(cached);

      this.reloadReport();

      return;
    }

    if (!id) {
      this.toastService.show('Reporte inválido', 'danger');
      this.router.navigate(['/beneficiaries-control']);
      return;
    }

    this.loadingReport.set(true);

    this.menuReportService.getMenuReportById(id).subscribe({
      next: (report) => {
        this.report.set(report);
        this.loadingReport.set(false);
      },
      error: () => {
        this.loadingReport.set(false);
        this.toastService.show('No se pudo cargar la orden', 'danger');
        this.router.navigate(['/beneficiaries-control']);
      },
    });
  }

  readonly allBeneficiaries = this.beneficiaryState.beneficiaries;
  goBack(): void {
    this.router.navigate(['/beneficiaries-control']);
  }
  readonly filteredBeneficiaries = computed(() => {
    const term = this.beneficiarySearch().toLowerCase();
    if (!term) return [];
    return this.allBeneficiaries().filter(
      (b) =>
        b.status === 'ACTIVO' &&
        (`${b.name} ${b.lastname}`.toLowerCase().includes(term) || b.dni.includes(term)),
    );
  });

  readonly availableBeneficiaries = computed(() => {
    const selectedId = this.selectedBeneficiary?.id;
    return this.allBeneficiaries()
      .filter((b) => b.status === 'ACTIVO')
      .filter((b) => b.id !== selectedId);
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
    const report = this.report();

    if (!report) return;

    this.listLoading.set(true);

    this.menuReportService
      .getMenuReportById(report.id)
      .pipe(
        finalize(() => {
          this.listLoading.set(false);
        }),
      )
      .subscribe({
        next: (response) => {
          this.report.set(response);
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

  private updateBeneficiaryStatus(
    record: BeneficiaryRecordResponse,
    changes: Partial<BeneficiaryRecordResponse>,
    rollback: () => void,
  ): void {
    this.updatingBeneficiaryId.set(record.id);
    const report = this.report();

    if (!report) return;
    const request = {
      beneficiarioId: record.id,
      pago: changes.pago ?? record.pago,
      entregado: changes.entregado ?? record.entregado,
      payMethod: record.metodoPago,
      menusAmount: record.cantidad,
      menuPrice: record.total / record.cantidad,
    };

    this.beneficiaryControlService
      .editBeneficiary(report.id, record.id, request)
      .pipe(
        finalize(() => {
          this.updatingBeneficiaryId.set(null);
        }),
      )
      .subscribe({
        next: () => {
          this.toastService.show('Estado actualizado', 'success');
        },
        error: () => {
          rollback();
          this.toastService.show('No se pudo actualizar', 'danger');
        },
      });
  }

  togglePago(record: BeneficiaryRecordResponse, event: Event): void {
    const checked = (event.target as HTMLInputElement).checked;
    const oldValue = record.pago;

    record.pago = checked;

    this.updateBeneficiaryStatus(record, { pago: checked }, () => (record.pago = oldValue));
  }

  toggleEntregado(record: BeneficiaryRecordResponse, event: Event): void {
    const checked = (event.target as HTMLInputElement).checked;
    const oldValue = record.entregado;

    record.entregado = checked;

    this.updateBeneficiaryStatus(
      record,
      { entregado: checked },
      () => (record.entregado = oldValue),
    );
  }

  clearBeneficiary(): void {
    this.selectedBeneficiary = null;
    this.beneficiarySearch.set('');
  }
}
