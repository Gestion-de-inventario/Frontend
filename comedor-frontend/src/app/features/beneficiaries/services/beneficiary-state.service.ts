import { Injectable, signal } from '@angular/core';
import { BeneficiaryResponse } from '../interfaces/beneficiary.response';

@Injectable({
  providedIn: 'root',
})
export class BeneficiaryStateService {
  private readonly _beneficiaries = signal<BeneficiaryResponse[]>([]);
  readonly beneficiaries = this._beneficiaries.asReadonly();

  private readonly _selectedBeneficiary = signal<BeneficiaryResponse | null>(null);
  readonly selectedBeneficiary = this._selectedBeneficiary.asReadonly();

  setBeneficiaries(beneficiaries: BeneficiaryResponse[]): void {
    this._beneficiaries.set(beneficiaries);
  }

  selectBeneficiary(beneficiary: BeneficiaryResponse): void {
    this._selectedBeneficiary.set(beneficiary);
  }

  clearSelectedBeneficiary(): void {
    this._selectedBeneficiary.set(null);
  }

  addBeneficiary(beneficiary: BeneficiaryResponse): void {
    this._beneficiaries.update((list) => [beneficiary, ...list]);
  }

  updateBeneficiary(updated: BeneficiaryResponse): void {
    this._beneficiaries.update((list) =>
      list.map((b) => (b.id === updated.id ? updated : b))
    );
    const selected = this._selectedBeneficiary();
    if (selected && selected.id === updated.id) {
      this._selectedBeneficiary.set(updated);
    }
  }
}