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
      validators: [
        Validators.required,
        Validators.minLength(8),
        Validators.maxLength(8),
        Validators.pattern(/^[0-9]+$/),
      ],
    }),

    name: new FormControl('', {
      nonNullable: true,
      validators: [
        Validators.required,
        Validators.minLength(2),
        Validators.maxLength(70),
        Validators.pattern(/^[A-Za-zÁÉÍÓÚáéíóúÑñ\s]+$/),
      ],
    }),

    lastname: new FormControl('', {
      nonNullable: true,
      validators: [
        Validators.required,
        Validators.minLength(2),
        Validators.maxLength(80),
        Validators.pattern(/^[A-Za-zÁÉÍÓÚáéíóúÑñ\s]+$/),
      ],
    }),

    status: new FormControl('', { nonNullable: true }),

    beneficiaryTypeId: new FormControl<number | null>(null, {
      validators: [Validators.required],
    }),
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

    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    this.loading.set(true);

    const raw = this.form.getRawValue();

    this.beneficiaryService
      .edit(beneficiary.id, {
        dni: raw.dni,
        name: raw.name.trim(),
        lastname: raw.lastname.trim(),
        beneficiaryTypeId: Number(raw.beneficiaryTypeId),
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
