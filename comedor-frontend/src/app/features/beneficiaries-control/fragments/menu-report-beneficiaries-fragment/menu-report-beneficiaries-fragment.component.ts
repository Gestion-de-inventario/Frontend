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
  payMethod = signal<string>('');
  pago = signal(false);
  entregado = signal(false);
  selectedBeneficiary = signal<BeneficiaryResponse | null>(null);
  editingRecord: BeneficiaryRecordResponse | null = null;
  beneficiaryToDelete: BeneficiaryRecordResponse | null = null;
  deletingLoading = signal(false);
  loading = signal(false);
  loadingReport = signal(false);

  listLoading = signal(false);

  silentSync = signal(false);

  updatingBeneficiaryId = signal<number | null>(null);

  submitted = signal(false);

  beneficiaryTouched = signal(false);
  menusAmountTouched = signal(false);
  menuPriceTouched = signal(false);

  private readonly statusDebounceMs = 200;

  private readonly pendingStatusChanges = new Map<number, Partial<BeneficiaryRecordResponse>>();

  private readonly statusTimers = new Map<number, ReturnType<typeof setTimeout>>();

  private readonly statusInFlight = new Set<number>();

  private readonly rollbackSnapshots = new Map<number, BeneficiaryRecordResponse>();

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
    this.router.navigate(['/history/menu-report']);
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
    const report = this.report();

    const registeredBeneficiaryIds = new Set(
      (report?.beneficiaries ?? []).map((record) => record.beneficiaryId),
    );

    const selectedId = this.selectedBeneficiary()?.id;

    return this.allBeneficiaries()
      .filter((b) => b.status === 'ACTIVO')
      .filter((b) => !registeredBeneficiaryIds.has(b.id))
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
    this.payMethod.set(record.paymentMethod);
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
    this.beneficiaryTouched.set(true);

    this.selectedBeneficiary.set(beneficiary);

    this.menuPrice.set(beneficiary.menu_cost);
  }

  navigateToCreateReport(): void {
    this.router.navigate(['/menu-report']);
  }

  saveBeneficiary(): void {
    const report = this.report();

    this.submitted.set(true);
    this.beneficiaryTouched.set(true);
    this.menusAmountTouched.set(true);
    this.menuPriceTouched.set(true);

    if (!report || this.loading()) return;
    if (!this.editingRecord && !this.selectedBeneficiary()) return;
    if (!this.menusAmount()) return;

    this.loading.set(true);

    const request = {
      beneficiarioId: this.editingRecord
        ? 0 // no se usa en edit
        : this.selectedBeneficiary()!.id,
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
        next: (record) => {
          if (this.editingRecord) {
            this.updateRecordInReport(record);
          } else {
            this.addRecordToReport(record);
          }

          this.toastService.show(
            this.editingRecord ? 'Beneficiario actualizado' : 'Beneficiario agregado',
            'success',
          );

          bootstrap.Modal.getInstance(document.getElementById('beneficiaryRecordModal')!)?.hide();

          this.resetForm();

          this.syncReportSilently();
        },
        error: (error) => {
          this.toastService.show('Error: ' + error.error.message, 'danger');
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
          const deletedId = this.beneficiaryToDelete!.id;

          this.removeRecordFromReport(deletedId);

          this.toastService.show('Registro eliminado', 'warning');
          bootstrap.Modal.getInstance(document.getElementById('deleteBeneficiaryModal')!)?.hide();
          this.beneficiaryToDelete = null;
          this.syncReportSilently();
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
    this.selectedBeneficiary.set(null);
    this.editingRecord = null;
    this.beneficiarySearch.set('');
    this.menusAmount.set(null);
    this.menuPrice.set(null);
    this.payMethod.set('EFECTIVO');
    this.pago.set(false);
    this.entregado.set(false);

    this.submitted.set(false);
    this.beneficiaryTouched.set(false);
    this.menusAmountTouched.set(false);
    this.menuPriceTouched.set(false);
  }

  private updateBeneficiaryStatus(
    record: BeneficiaryRecordResponse,
    changes: Partial<BeneficiaryRecordResponse>,
    rollbackChanges: Partial<BeneficiaryRecordResponse>,
  ): void {
    const report = this.report();

    if (!report) return;

    const request: any = {
      beneficiarioId: record.beneficiaryId ?? record.id,
    };

    if (changes.pago !== undefined) {
      request.pago = changes.pago;
    }

    if (changes.entregado !== undefined) {
      request.entregado = changes.entregado;
    }

    if (changes.paymentMethod !== undefined) {
      request.payMethod = changes.paymentMethod;
    }

    if (changes.cantidad !== undefined) {
      request.menusAmount = changes.cantidad;
    }

    if (changes.total !== undefined && record.cantidad > 0) {
      request.menuPrice = changes.total / record.cantidad;
    }

    if (Object.keys(request).length === 1) {
      return;
    }

    this.patchRecordInReport(record.id, changes);

    this.updatingBeneficiaryId.set(record.id);

    this.beneficiaryControlService
      .editBeneficiary(report.id, record.id, request)
      .pipe(
        finalize(() => {
          this.updatingBeneficiaryId.set(null);
        }),
      )
      .subscribe({
        next: (updatedRecord) => {
          this.updateRecordInReport(updatedRecord);

          this.syncReportSilently();
          this.toastService.show('Estado actualizado', 'success');
        },
        error: () => {
          this.patchRecordInReport(record.id, rollbackChanges);

          this.toastService.show('No se pudo actualizar', 'danger');
        },
      });
  }

  togglePago(record: BeneficiaryRecordResponse, event: Event): void {
    const checked = (event.target as HTMLInputElement).checked;

    this.queueBeneficiaryStatusUpdate(record.id, {
      pago: checked,
    });
  }

  toggleEntregado(record: BeneficiaryRecordResponse, event: Event): void {
    const checked = (event.target as HTMLInputElement).checked;

    this.queueBeneficiaryStatusUpdate(record.id, {
      entregado: checked,
    });
  }
  clearBeneficiary(): void {
    this.selectedBeneficiary.set(null);
    this.beneficiarySearch.set('');
    this.beneficiaryTouched.set(true);
  }

  private syncReportSilently(): void {
    const report = this.report();

    if (!report || this.silentSync()) return;

    this.silentSync.set(true);

    this.menuReportService
      .getMenuReportById(report.id)
      .pipe(
        finalize(() => {
          this.silentSync.set(false);
        }),
      )
      .subscribe({
        next: (backendReport) => {
          this.mergeReportPreservingBeneficiaryOrder(backendReport);
        },
        error: () => {
          console.warn('No se pudo sincronizar el reporte en segundo plano');
        },
      });
  }

  private addRecordToReport(record: BeneficiaryRecordResponse): void {
    this.report.update((report) => {
      if (!report) return report;

      return {
        ...report,
        beneficiaries: [...(report.beneficiaries ?? []), record],
      };
    });
  }

  private updateRecordInReport(record: BeneficiaryRecordResponse): void {
    this.report.update((report) => {
      if (!report) return report;

      return {
        ...report,
        beneficiaries: report.beneficiaries.map((item) => (item.id === record.id ? record : item)),
      };
    });
  }

  private removeRecordFromReport(recordId: number): void {
    this.report.update((report) => {
      if (!report) return report;

      return {
        ...report,
        beneficiaries: report.beneficiaries.filter((item) => item.id !== recordId),
      };
    });
  }

  isRequiredValue(value: number | null | undefined): boolean {
    return value === null || value === undefined || Number.isNaN(Number(value));
  }

  isPositiveNumber(value: number | null | undefined): boolean {
    return Number(value) >= 0;
  }

  isDecimalOrInteger(value: number | null | undefined): boolean {
    if (value === null || value === undefined) return false;

    return /^\d+(\.\d+)?$/.test(String(value));
  }

  isMenusAmountInvalid(): boolean {
    const value = this.menusAmount();

    return (
      this.isRequiredValue(value) ||
      !this.isDecimalOrInteger(value) ||
      !this.isPositiveNumber(value)
    );
  }

  isMenuPriceInvalid(): boolean {
    const value = this.menuPrice();

    return (
      this.isRequiredValue(value) ||
      !this.isPositiveNumber(value) ||
      !this.hasValidPriceFormat(value)
    );
  }

  isBeneficiaryInvalid(): boolean {
    return !this.editingRecord && !this.selectedBeneficiary();
  }

  isFormInvalid(): boolean {
    if (this.isBeneficiaryInvalid()) return true;

    if (this.isMenusAmountInvalid()) return true;

    if (this.isMenuPriceInvalid()) return true;

    return false;
  }

  shouldShowBeneficiaryError(): boolean {
    return this.submitted() || this.beneficiaryTouched();
  }

  shouldShowMenusAmountError(): boolean {
    return this.submitted() || this.menusAmountTouched();
  }

  shouldShowMenuPriceError(): boolean {
    return this.submitted() || this.menuPriceTouched();
  }
  limitQuantityDigits(event: Event): void {
    this.menusAmountTouched.set(true);

    const input = event.target as HTMLInputElement;

    input.value = input.value.replace(/\D/g, '').slice(0, 5);

    this.menusAmount.set(input.value ? Number(input.value) : null);
  }

  limitPriceDigits(event: Event): void {
    this.menuPriceTouched.set(true);

    const input = event.target as HTMLInputElement;

    let value = input.value;

    value = value.replace(',', '.');

    value = value.replace(/[^0-9.]/g, '');

    const parts = value.split('.');
    const integerPart = parts[0].slice(0, 5);
    const decimalPart = parts[1]?.slice(0, 2);

    if (parts.length > 1) {
      value = `${integerPart}.${decimalPart ?? ''}`;
    } else {
      value = integerPart;
    }

    input.value = value;

    this.menuPrice.set(value ? Number(value) : null);
  }

  hasValidPriceFormat(value: number | null | undefined): boolean {
    if (value === null || value === undefined) return false;

    return /^\d{1,5}(\.\d{1,2})?$/.test(String(value));
  }

  private patchRecordInReport(recordId: number, changes: Partial<BeneficiaryRecordResponse>): void {
    this.report.update((report) => {
      if (!report) return report;

      return {
        ...report,
        beneficiaries: report.beneficiaries.map((item) =>
          item.id === recordId
            ? {
                ...item,
                ...changes,
              }
            : item,
        ),
      };
    });
  }

  private mergeReportPreservingBeneficiaryOrder(backendReport: MenuReportResponse): void {
    this.report.update((currentReport) => {
      if (!currentReport) return backendReport;

      const currentBeneficiaries = currentReport.beneficiaries ?? [];
      const backendBeneficiaries = backendReport.beneficiaries ?? [];

      const backendById = new Map(backendBeneficiaries.map((record) => [record.id, record]));

      const currentIds = new Set(currentBeneficiaries.map((record) => record.id));

      const beneficiariesInCurrentOrder = currentBeneficiaries
        .filter((record) => backendById.has(record.id))
        .map((record) => backendById.get(record.id)!);

      const newBeneficiariesFromBackend = backendBeneficiaries.filter(
        (record) => !currentIds.has(record.id),
      );

      return {
        ...backendReport,
        beneficiaries: [...beneficiariesInCurrentOrder, ...newBeneficiariesFromBackend],
      };
    });
  }

  private findRecordById(recordId: number): BeneficiaryRecordResponse | null {
    return this.report()?.beneficiaries?.find((item) => item.id === recordId) ?? null;
  }

  private queueBeneficiaryStatusUpdate(
    recordId: number,
    changes: Partial<BeneficiaryRecordResponse>,
  ): void {
    const currentRecord = this.findRecordById(recordId);

    if (!currentRecord) return;

    if (!this.rollbackSnapshots.has(recordId)) {
      this.rollbackSnapshots.set(recordId, { ...currentRecord });
    }

    this.patchRecordInReport(recordId, changes);

    const currentPending = this.pendingStatusChanges.get(recordId) ?? {};

    this.pendingStatusChanges.set(recordId, {
      ...currentPending,
      ...changes,
    });

    const previousTimer = this.statusTimers.get(recordId);

    if (previousTimer) {
      clearTimeout(previousTimer);
    }

    const timer = setTimeout(() => {
      this.flushBeneficiaryStatusUpdate(recordId);
    }, this.statusDebounceMs);

    this.statusTimers.set(recordId, timer);
  }

  private flushBeneficiaryStatusUpdate(recordId: number): void {
    if (this.statusInFlight.has(recordId)) {
      return;
    }

    const report = this.report();
    const record = this.findRecordById(recordId);
    const changes = this.pendingStatusChanges.get(recordId);

    if (!report || !record || !changes) return;

    this.pendingStatusChanges.delete(recordId);
    this.statusTimers.delete(recordId);
    this.statusInFlight.add(recordId);

    const request: any = {
      beneficiarioId: record.beneficiaryId ?? record.id,
    };

    if (changes.pago !== undefined) {
      request.pago = changes.pago;
    }

    if (changes.entregado !== undefined) {
      request.entregado = changes.entregado;
    }

    if (changes.paymentMethod !== undefined) {
      request.payMethod = changes.paymentMethod;
    }

    if (changes.cantidad !== undefined) {
      request.menusAmount = changes.cantidad;
    }

    if (changes.total !== undefined && record.cantidad > 0) {
      request.menuPrice = changes.total / record.cantidad;
    }

    if (Object.keys(request).length === 1) {
      this.statusInFlight.delete(recordId);
      return;
    }

    this.beneficiaryControlService
      .editBeneficiary(report.id, record.id, request)
      .pipe(
        finalize(() => {
          this.statusInFlight.delete(recordId);

          if (this.pendingStatusChanges.has(recordId)) {
            this.flushBeneficiaryStatusUpdate(recordId);
            return;
          }

          this.rollbackSnapshots.delete(recordId);
        }),
      )
      .subscribe({
        next: (updatedRecord) => {
          const stillPending = this.pendingStatusChanges.get(recordId);
          const currentOptimistic = this.findRecordById(recordId);

          this.updateRecordInReport({
            ...updatedRecord,
            pago: stillPending?.pago ?? currentOptimistic?.pago ?? updatedRecord.pago,
            entregado:
              stillPending?.entregado ?? currentOptimistic?.entregado ?? updatedRecord.entregado,
          });

          if (!this.pendingStatusChanges.has(recordId)) {
            this.syncReportSilently();
          }
        },
        error: () => {
          const snapshot = this.rollbackSnapshots.get(recordId);

          if (snapshot) {
            this.updateRecordInReport(snapshot);
          }

          this.pendingStatusChanges.delete(recordId);
          this.rollbackSnapshots.delete(recordId);

          const timer = this.statusTimers.get(recordId);

          if (timer) {
            clearTimeout(timer);
            this.statusTimers.delete(recordId);
          }

          this.toastService.show('No se pudo actualizar', 'danger');
        },
      });
  }
}
