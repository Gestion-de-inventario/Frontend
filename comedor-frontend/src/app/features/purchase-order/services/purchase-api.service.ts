import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';

import { Observable } from 'rxjs';

import { environment } from '@env/environment';

import { CreatePurchaseRequest } from '../interfaces/purchase.request';
import { PurchaseResponse } from '../interfaces/purchase.response';

@Injectable({
  providedIn: 'root',
})
export class PurchaseApiService {
  private readonly http = inject(HttpClient);

  private readonly apiUrl = `${environment.apiUrl}/purchases`;

  create(request: CreatePurchaseRequest): Observable<PurchaseResponse> {
    return this.http.post<PurchaseResponse>(this.apiUrl, request);
  }
}
