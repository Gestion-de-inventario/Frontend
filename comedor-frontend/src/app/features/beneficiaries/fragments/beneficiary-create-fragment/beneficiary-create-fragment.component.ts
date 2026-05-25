import { Component, inject, signal } from '@angular/core';
import { FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { BeneficiaryApiService } from '@features/beneficiaries/services/beneficiary-api.service';
import { BeneficiaryStateService } from '@features/beneficiaries/services/beneficiary-state.service';
import { ToastService } from '@shared/services/toast.service';

declare const bootstrap: any;

@Component({
  selector: 'app-beneficiary-create-fragment',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, FormsModule],
  templateUrl: './beneficiary-create-fragment.component.html',
  styleUrl: './beneficiary-create-fragment.scss'
})
export class BeneficiaryCreateFragmentComponent {
  private readonly beneficiaryService = inject(BeneficiaryApiService);
  private readonly beneficiaryState = inject(BeneficiaryStateService);
  private readonly toastService = inject(ToastService);

  loading = false;
  reniecError: string | null = null;
  dniSearch = signal('');

  readonly manualForm = new FormGroup({
    dni: new FormControl('', {
      nonNullable: true,
      validators: [Validators.required, Validators.minLength(8), Validators.maxLength(8)],
    }),
    name: new FormControl('', {
      nonNullable: true,
      validators: [Validators.required],
    }),
    lastname: new FormControl('', {
      nonNullable: true,
      validators: [Validators.required],
    }),
  });

  openModalManual(): void {
    const modal = new bootstrap.Modal(document.getElementById('createBeneficiaryManualModal'));
    modal.show();
  }

  openModalReniec(): void {
    this.resetReniec();
    const modal = new bootstrap.Modal(document.getElementById('createBeneficiaryReniecModal'));
    modal.show();
  }

  createManual(): void {
    if (this.manualForm.invalid || this.loading) return;
    this.loading = true;

    this.beneficiaryService.createManual(this.manualForm.getRawValue()).subscribe({
      next: (created) => {
        this.beneficiaryState.addBeneficiary(created);
        this.toastService.show('Beneficiario creado correctamente', 'success');
        this.manualForm.reset();
        bootstrap.Modal.getInstance(document.getElementById('createBeneficiaryManualModal')!)?.hide();
      },
      error: (error) => {
        this.toastService.show('No se pudo crear: ' + error.error.message, 'danger');
      },
      complete: () => {
        this.loading = false;
      },
    });
  }

  createByDni(): void {
    if (this.dniSearch().length !== 8 || this.loading) return;

    this.loading = true;
    this.reniecError = null;

    this.beneficiaryService.createByDni(this.dniSearch()).subscribe({
      next: (created) => {
        this.beneficiaryState.addBeneficiary(created);
        this.toastService.show('Beneficiario registrado correctamente', 'success');
        this.resetReniec();
        bootstrap.Modal.getInstance(document.getElementById('createBeneficiaryReniecModal')!)?.hide();
      },
      error: (error) => {
        this.reniecError = error.error?.message ?? 'No se pudo registrar el beneficiario';
        this.loading = false;
      },
      complete: () => {
        this.loading = false;
      },
    });
  }

  resetReniec(): void {
    this.dniSearch.set('');
    this.reniecError = null;
  }
}