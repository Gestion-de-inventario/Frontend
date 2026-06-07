import { Component, computed, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';

import { AuthStateService } from '@core/auth/services/auth-state.service';

import { ToastService } from '@shared/services/toast.service';

import { BeneficiaryTypeApiService } from '../../services/beneficiaryType-api.service';
import { BeneficiaryTypeStateService } from '../../services/beneficiaryType-state.service';

@Component({
  selector: 'app-beneficiary-type-detail-modal',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './beneficiary-type-detail-modal.component.html',
})
export class BeneficiaryTypeDetailModalComponent {
  readonly authState = inject(AuthStateService);

  private readonly service = inject(BeneficiaryTypeApiService);

  private readonly state = inject(BeneficiaryTypeStateService);

  private readonly toastService = inject(ToastService);

  readonly beneficiaryType = computed(() => this.state.selectedType());

  mode: 'view' | 'edit' = 'view';

  readonly loading = signal(false);

  readonly form = new FormGroup({
    name: new FormControl('', {
      nonNullable: true,
      validators: [Validators.required],
    }),

    desc: new FormControl('', {
      nonNullable: true,
      validators: [Validators.required],
    }),

    menu_cost: new FormControl<number | null>(null, {
      validators: [Validators.required],
    }),
  });

  openEdit(): void {
    const type = this.beneficiaryType();

    if (!type) {
      return;
    }

    this.form.patchValue({
      name: type.name,
      desc: type.desc,
      menu_cost: type.menu_cost,
    });

    this.mode = 'edit';
  }

  goBack(): void {
    this.mode = 'view';
  }

  save(): void {
    const type = this.beneficiaryType();

    if (!type || this.form.invalid || this.loading()) {
      return;
    }

    this.loading.set(true);

    this.service.edit(type.id, this.form.getRawValue() as any).subscribe({
      next: (updated) => {
        this.state.updateType(updated);

        this.toastService.show('Tipo de beneficiario actualizado', 'success');

        this.mode = 'view';
        this.loading.set(false);
      },

      error: (error) => {
        this.toastService.show(error.error?.message || 'Error al actualizar', 'danger');
        this.loading.set(false);
      },

      complete: () => {
        this.loading.set(false);
      },
    });
  }

  changeStatus(status: 'ACTIVAR' | 'DESACTIVAR'): void {
    const type = this.beneficiaryType();

    if (!type || this.loading()) {
      return;
    }

    this.loading.set(true);

    this.service.changeStatus(type.id, status).subscribe({
      next: (updated) => {
        this.state.updateType(updated);

        this.toastService.show(
          status === 'ACTIVAR' ? 'Tipo activado' : 'Tipo desactivado',
          status === 'ACTIVAR' ? 'success' : 'warning',
        );
        this.loading.set(false);
      },

      error: (error) => {
        this.toastService.show(error.error?.message || 'Error al cambiar estado', 'danger');
        this.loading.set(false);
      },

      complete: () => {
        this.loading.set(false);
      },
    });
  }

  close(): void {
    this.mode = 'view';

    this.state.clearSelectedType();
  }
}
