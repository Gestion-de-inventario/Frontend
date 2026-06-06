import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';

import { Observable } from 'rxjs';

import { environment } from '@env/environment';

import { buildEndpoint } from '@shared/utils/api.utils';

import { beneficiaryTypeRequest } from '@features/beneficiaryType/interfaces/beneficiaryType.request';
import { beneficiaryTypeResponse } from '@features/beneficiaryType/interfaces/beneficiaryType.response';

import { API_ENDPOINTS } from '@core/constants/api-endpoints';

@Injectable({
  providedIn: 'root',
})
export class BeneficiaryTypeApiService {
  private readonly http = inject(HttpClient);

  private readonly apiUrl = `${environment.apiUrl}`;

  create(request: beneficiaryTypeRequest): Observable<beneficiaryTypeResponse> {
    return this.http.post<beneficiaryTypeResponse>(
      `${this.apiUrl}${API_ENDPOINTS.BENEFICIARY_TYPE.CREATE}`,
      request,
    );
  }

  list(status?: string): Observable<beneficiaryTypeResponse[]> {
    let params = new HttpParams();

    if (status) {
      params = params.set('status', status);
    }

    return this.http.get<beneficiaryTypeResponse[]>(
      `${this.apiUrl}${API_ENDPOINTS.BENEFICIARY_TYPE.LIST_BY_STATUS}`,
      { params },
    );
  }

  edit(id: number, request: beneficiaryTypeRequest): Observable<beneficiaryTypeResponse> {
    const endpoint = buildEndpoint(API_ENDPOINTS.BENEFICIARY_TYPE.EDIT, { id });

    return this.http.put<beneficiaryTypeResponse>(`${this.apiUrl}${endpoint}`, request);
  }

  changeStatus(id: number, status: 'ACTIVAR' | 'DESACTIVAR'): Observable<beneficiaryTypeResponse> {
    const endpoint = buildEndpoint(API_ENDPOINTS.BENEFICIARY_TYPE.CHANGE_STATUS, { id });

    const params = new HttpParams().set('status', status);

    return this.http.put<beneficiaryTypeResponse>(`${this.apiUrl}${endpoint}`, {}, { params });
  }
}
