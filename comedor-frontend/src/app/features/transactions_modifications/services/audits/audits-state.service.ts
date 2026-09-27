import { Injectable, signal } from '@angular/core';
import { AuditsResponse } from '@features/transactions_modifications/interfaces/audits/audits.response';

@Injectable({ providedIn: 'root' })
export class AuditsStateService {
  private _audits = signal<AuditsResponse[]>([]);

  readonly audits = this._audits.asReadonly();

  set(data: AuditsResponse[]) {
    this._audits.set(data);
  }
}
