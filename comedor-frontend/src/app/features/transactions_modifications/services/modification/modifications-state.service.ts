import { Injectable, signal } from '@angular/core';
import { ModificationsResponse } from '@features/transactions_modifications/interfaces/modifications/modifications.response';

@Injectable({ providedIn: 'root' })
export class ModificationsStateService {
  private _modifications = signal<ModificationsResponse[]>([]);

  readonly modifications = this._modifications.asReadonly();

  set(data: ModificationsResponse[]) {
    this._modifications.set(data);
  }
}
