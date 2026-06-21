import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';

import { Observable } from 'rxjs';

import { environment } from '@env/environment';

import { buildEndpoint } from '@shared/utils/api.utils';

import { API_ENDPOINTS } from '@core/constants/api-endpoints';

import { CreateDonationRequest } from '../interfaces/donation/donation.request';
import { DonationResponse } from '../interfaces/donation/donation.response';
import { DonationPageResponse } from '../interfaces/list-donations/donation-page.response';

@Injectable({
  providedIn: 'root',
})
export class DonationApiService {
  private readonly http = inject(HttpClient);

  private readonly apiUrl = `${environment.apiUrl}/donations`;

  create(request: CreateDonationRequest): Observable<DonationResponse> {
    return this.http.post<DonationResponse>(this.apiUrl, request);
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

    return this.http.get<DonationPageResponse>(this.apiUrl, {
      params,
    });
  }

  getById(id: number): Observable<DonationResponse> {
    const endpoint = buildEndpoint(API_ENDPOINTS.DONATION.GET_BY_ID, { id });

    return this.http.get<DonationResponse>(`${this.apiUrl}${endpoint}`);
  }

  confirmDonation(id: number) {
    const endpoint = buildEndpoint(API_ENDPOINTS.DONATION.CHANGE_STATUS, { id });

    return this.http.patch<DonationResponse>(`${this.apiUrl}${endpoint}`, {});
  }
}
