import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';

import { environment } from '@env/environment';
import { API_ENDPOINTS } from '@core/constants/api-endpoints';

import { TransactionsResponse } from '@features/transactions_modifications/interfaces/transactions/transactions.response';
import { PageResponse } from '@features/transactions_modifications/interfaces/pages/page.response';

@Injectable({
  providedIn: 'root',
})
export class TransactionService {
  private apiUrl = environment.apiUrl;

  constructor(private http: HttpClient) {}

  list(page: number = 0, size: number = 20) {
    return this.http.get<PageResponse<TransactionsResponse>>(
      `${this.apiUrl}${API_ENDPOINTS.TRANSACTION.LIST_ALL}`,
      {
        params: { page, size },
      },
    );
  }
}
