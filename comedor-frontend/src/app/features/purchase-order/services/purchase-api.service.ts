import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';

import { Observable } from 'rxjs';

import { environment } from '@env/environment';

import { buildEndpoint } from '@shared/utils/api.utils';

import { CreatePurchaseRequest } from '../interfaces/purchase.request';
import { PurchaseResponse } from '../interfaces/purchase.response';
import { PurchasePageResponse } from '../interfaces/list-purchases/purchase-page.response';
import { API_ENDPOINTS } from '@core/constants/api-endpoints';

@Injectable({
  providedIn: 'root',
})
export class PurchaseApiService {
  private readonly http = inject(HttpClient);

  private readonly apiUrl = `${environment.apiUrl}/purchases`;

  create(request: CreatePurchaseRequest): Observable<PurchaseResponse> {
    return this.http.post<PurchaseResponse>(this.apiUrl, request);
  }

  list(page = 0, size = 20, startDate?: string, endDate?: string, status?: string) {
    let params = new HttpParams().set('page', page).set('size', size);

    if (startDate) {
      params = params.set('startDate', startDate);
    }

    if (endDate) {
      params = params.set('endDate', endDate);
    }

    if (status) {
      params = params.set('status', status);
    }

    return this.http.get<PurchasePageResponse>(this.apiUrl, { params });
  }

  confirmPurchase(id: number) {
    const endpoint = buildEndpoint(API_ENDPOINTS.PURCHASE.CHANGE_STATUS, { id });
    return this.http.patch<PurchaseResponse>(`${this.apiUrl}${endpoint}`, {});
  }
}
