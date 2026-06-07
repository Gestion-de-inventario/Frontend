import { Component, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';

import { FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';

import { ToastService } from '@shared/services/toast.service';

import { BeneficiaryTypeApiService } from '../../services/beneficiaryType-api.service';
import { BeneficiaryTypeStateService } from '../../services/beneficiaryType-state.service';
import { beneficiaryTypeResponse } from '@features/beneficiaryType/interfaces/beneficiaryType.response';
declare const bootstrap: any;
@Component({
  selector: 'app-beneficiary-type-create-fragment',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './beneficiary-type-create-fragment.component.html',
})
export class BeneficiaryTypeCreateFragmentComponent {
  private readonly service = inject(BeneficiaryTypeApiService);

  private readonly state = inject(BeneficiaryTypeStateService);

  private readonly toastService = inject(ToastService);

  readonly loading = signal(false);

  types: beneficiaryTypeResponse[] = [];

  readonly form = new FormGroup({
    name: new FormControl('', {
      nonNullable: true,
      validators: [Validators.required, Validators.minLength(3)],
    }),

    desc: new FormControl('', {
      nonNullable: true,
      validators: [Validators.required, Validators.minLength(5)],
    }),

    menu_cost: new FormControl<number | null>(null, {
      validators: [Validators.required, Validators.min(0.01)],
    }),
  });

  constructor() {
    this.loadTypes();
  }

  loadTypes(): void {
    this.service.list().subscribe({
      next: (types) => {
        this.types = types;
      },
    });
  }

  openModal(): void {
    this.form.reset();

    this.form.patchValue({
      name: '',
      desc: '',
      menu_cost: null,
    });

    const modal = new bootstrap.Modal(document.getElementById('beneficiaryTypeCreateModal'));

    modal.show();
  }

  closeModal(): void {
    const modalElement = document.getElementById('beneficiaryTypeCreateModal');

    const modal = bootstrap.Modal.getInstance(modalElement);

    modal?.hide();
  }

  save(): void {
    if (this.form.invalid || this.loading()) {
      this.form.markAllAsTouched();
      return;
    }

    this.loading.set(true);

    this.service.create(this.form.getRawValue() as any).subscribe({
      next: (created) => {
        this.state.addType(created);

        this.toastService.show('Tipo de beneficiario creado correctamente', 'success');

        this.closeModal();

        this.form.reset();

        this.form.patchValue({
          name: '',
          desc: '',
          menu_cost: null,
        });
        this.loading.set(false);
      },

      error: (error) => {
        this.toastService.show(error.error?.message || 'Error al registrar', 'danger');
        this.loading.set(false);
      },

      complete: () => {
        this.loading.set(false);
      },
    });
  }
}
