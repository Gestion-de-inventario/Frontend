import { Injectable, signal } from '@angular/core';
import { TransactionsResponse } from '@features/transactions_modifications/interfaces/transactions/transactions.response';

@Injectable({ providedIn: 'root' })
export class TransactionStateService {
  private _transactions = signal<TransactionsResponse[]>([]);

  readonly transactions = this._transactions.asReadonly();

  set(data: TransactionsResponse[]) {
    this._transactions.set(data);
  }
}
