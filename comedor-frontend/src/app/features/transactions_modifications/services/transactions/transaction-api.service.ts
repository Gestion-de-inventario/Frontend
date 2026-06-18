import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';

import { environment } from '@env/environment';
import { API_ENDPOINTS } from '@core/constants/api-endpoints';
import { TransactionPageResponse } from '@features/transactions_modifications/interfaces/transactions/pageable.transactions.response';

@Injectable({
  providedIn: 'root',
})
export class TransactionService {
  private readonly baseUrl = environment.apiUrl;

  constructor(private http: HttpClient) {}

  getTransactions(
    page: number,
    size: number,
    fechaInicio?: string,
    fechaFin?: string,
    type?: string,
    source?: string,
    productName?: string,
  ) {
    let params = new HttpParams().set('page', page.toString()).set('size', size.toString());

    if (fechaInicio) {
      params = params.set('fechaInicio', fechaInicio);
    }

    if (fechaFin) {
      params = params.set('fechaFin', fechaFin);
    }

    if (type) {
      params = params.set('type', type);
    }

    if (source) {
      params = params.set('source', source);
    }

    if (productName) {
      params = params.set('productName', productName);
    }

    return this.http.get<TransactionPageResponse>(
      `${this.baseUrl}${API_ENDPOINTS.TRANSACTION.LIST_ALL}`,
      { params },
    );
  }

  exportPdf(fechaInicio?: string, fechaFin?: string): Observable<Blob> {
    let params = new HttpParams();
    if (fechaInicio) params = params.set('fechaInicio', fechaInicio);
    if (fechaFin) params = params.set('fechaFin', fechaFin);

    // IMPORTANTE: responseType 'blob' para manejar archivos
    return this.http.get(`${this.baseUrl}${API_ENDPOINTS.TRANSACTION.EXPORT_PDF}`, {
      params,
      responseType: 'blob',
    });
  }
}
