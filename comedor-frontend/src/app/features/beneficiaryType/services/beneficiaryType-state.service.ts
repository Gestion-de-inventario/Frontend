import { Injectable, signal } from '@angular/core';
import { beneficiaryTypeResponse } from '@features/beneficiaryType/interfaces/beneficiaryType.response';

@Injectable({
  providedIn: 'root',
})
export class BeneficiaryTypeStateService {
  private readonly _types = signal<beneficiaryTypeResponse[]>([]);

  readonly types = this._types.asReadonly();

  setTypes(types: beneficiaryTypeResponse[]): void {
    this._types.set(types);
  }

  clear(): void {
    this._types.set([]);
  }

  findById(id: number): beneficiaryTypeResponse | undefined {
    return this._types().find((t) => t.id === id);
  }
}
