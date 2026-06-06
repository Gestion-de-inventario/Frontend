import { Component, computed, inject, signal } from '@angular/core';
import { FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { AuthStateService } from '@core/auth/services/auth-state.service';
import { ToastService } from '@shared/services/toast.service';
import { BeneficiaryApiService } from '@features/beneficiaries/services/beneficiary-api.service';
import { BeneficiaryStateService } from '@features/beneficiaries/services/beneficiary-state.service';
import { BeneficiaryTypeApiService } from '@features/beneficiaryType/services/beneficiaryType-api.service';
import { BeneficiaryTypeStateService } from '@features/beneficiaryType/services/beneficiaryType-state.service';

@Component({
  selector: 'app-beneficiary-detail-modal',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './beneficiary-detail-modal.component.html',
})
export class BeneficiaryDetailModalComponent {
  readonly authState = inject(AuthStateService);
  private readonly beneficiaryState = inject(BeneficiaryStateService);
  private readonly beneficiaryService = inject(BeneficiaryApiService);
  private readonly beneficiaryTypeApi = inject(BeneficiaryTypeApiService);
  private readonly beneficiaryTypeState = inject(BeneficiaryTypeStateService);
  private readonly toastService = inject(ToastService);

  readonly beneficiaryTypes = this.beneficiaryTypeState.types;

  readonly beneficiary = computed(() => this.beneficiaryState.selectedBeneficiary());

  mode: 'view' | 'edit' = 'view';
  loading = signal<boolean>(false);

  readonly form = new FormGroup({
    dni: new FormControl('', {
      nonNullable: true,
      validators: [Validators.minLength(8), Validators.maxLength(8)],
    }),
    name: new FormControl('', { nonNullable: true }),
    lastname: new FormControl('', { nonNullable: true }),
    status: new FormControl('', { nonNullable: true }),
    beneficiaryTypeId: new FormControl<number | null>(null),
  });

  ngOnInit(): void {
    this.loadBeneficiaryTypes();
  }
  private loadBeneficiaryTypes(): void {
    this.beneficiaryTypeApi.list('ACTIVO').subscribe({
      next: (types) => {
        this.beneficiaryTypeState.setTypes(types);
      },
    });
  }

  openEdit(): void {
    const beneficiary = this.beneficiary();
    if (!beneficiary) return;

    this.form.patchValue({
      dni: beneficiary.dni,
      name: beneficiary.name,
      lastname: beneficiary.lastname,
      status: beneficiary.status,
      beneficiaryTypeId: beneficiary.beneficiaryTypeId,
    });

    this.mode = 'edit';
  }

  goBack(): void {
    this.mode = 'view';
  }

  save(): void {
    const beneficiary = this.beneficiary();
    if (!beneficiary || this.loading()) return;

    this.loading.set(true);

    this.beneficiaryService
      .edit(beneficiary.id, {
        dni: this.form.value.dni || undefined,
        name: this.form.value.name || undefined,
        lastname: this.form.value.lastname || undefined,
        beneficiaryTypeId: Number(this.form.value.beneficiaryTypeId) || undefined,
      })
      .subscribe({
        next: (updated) => {
          this.beneficiaryState.updateBeneficiary(updated);
          this.toastService.show('Beneficiario actualizado', 'success');
          this.mode = 'view';
        },
        error: (error) => {
          this.toastService.show('No se pudo actualizar: ' + error.error.message, 'danger');
          this.loading.set(false);
        },
        complete: () => {
          this.loading.set(false);
        },
      });
  }

  close(): void {
    this.mode = 'view';
    this.beneficiaryState.clearSelectedBeneficiary();
  }

  changeStatus(status: string): void {
    const beneficiary = this.beneficiary();
    if (!beneficiary || this.loading()) return;

    this.loading.set(true);

    this.beneficiaryService.changeStatus(beneficiary.id, status).subscribe({
      next: (updated) => {
        this.beneficiaryState.updateBeneficiary(updated);
        this.toastService.show(
          status === 'ACTIVO' ? 'Beneficiario activado' : 'Beneficiario desactivado',
          status === 'ACTIVO' ? 'success' : 'warning',
        );
      },
      error: (error) => {
        this.toastService.show('No se pudo cambiar el estado: ' + error.error.message, 'danger');
        this.loading.set(false);
      },
      complete: () => {
        this.loading.set(false);
      },
    });
  }
}
