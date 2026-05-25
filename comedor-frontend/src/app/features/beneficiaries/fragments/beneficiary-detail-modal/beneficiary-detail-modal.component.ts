import { Component, computed, inject } from '@angular/core';
import { FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { AuthStateService } from '@core/auth/services/auth-state.service';
import { ToastService } from '@shared/services/toast.service';
import { BeneficiaryApiService } from '@features/beneficiaries/services/beneficiary-api.service';
import { BeneficiaryStateService } from '@features/beneficiaries/services/beneficiary-state.service';

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
  private readonly toastService = inject(ToastService);

  readonly beneficiary = computed(() => this.beneficiaryState.selectedBeneficiary());

  mode: 'view' | 'edit' = 'view';
  loading = false;

  readonly form = new FormGroup({
    dni: new FormControl('', {
      nonNullable: true,
      validators: [Validators.minLength(8), Validators.maxLength(8)],
    }),
    name: new FormControl('', { nonNullable: true }),
    lastname: new FormControl('', { nonNullable: true }),
    status: new FormControl('', { nonNullable: true }),
  });

  openEdit(): void {
    const beneficiary = this.beneficiary();
    if (!beneficiary) return;

    this.form.patchValue({
      dni: beneficiary.dni,
      name: beneficiary.name,
      lastname: beneficiary.lastname,
      status: beneficiary.status,
    });

    this.mode = 'edit';
  }

  goBack(): void {
    this.mode = 'view';
  }

  save(): void {
    const beneficiary = this.beneficiary();
    if (!beneficiary || this.loading) return;

    this.loading = true;

    this.beneficiaryService.edit(beneficiary.id, {
      dni: this.form.value.dni || undefined,
      name: this.form.value.name || undefined,
      lastname: this.form.value.lastname || undefined,
      status: this.form.value.status || undefined,
    }).subscribe({
      next: (updated) => {
        this.beneficiaryState.updateBeneficiary(updated);
        this.toastService.show('Beneficiario actualizado', 'success');
        this.mode = 'view';
      },
      error: (error) => {
        this.toastService.show('No se pudo actualizar: ' + error.error.message, 'danger');
      },
      complete: () => {
        this.loading = false;
      },
    });
  }

  close(): void {
    this.mode = 'view';
    this.beneficiaryState.clearSelectedBeneficiary();
  }
}