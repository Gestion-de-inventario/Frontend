import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';

import { Observable } from 'rxjs';

import { environment } from '@env/environment';
import { API_ENDPOINTS } from '@core/constants/api-endpoints';

import { ModificationsResponse } from '@features/transactions_modifications/interfaces/modifications/modifications.response';
import { PageResponse } from '@features/transactions_modifications/interfaces/pages/page.response';

@Injectable({
  providedIn: 'root',
})
export class ModificationsService {
  private readonly baseUrl = environment.apiUrl;

  constructor(private http: HttpClient) {}

  getModifications(page: number, size: number, fechaInicio?: string, fechaFin?: string): Observable<any> {
    let params = new HttpParams()
      .set('page', page.toString())
      .set('size', size.toString());

    if (fechaInicio) params = params.set('fechaInicio', fechaInicio);
    if (fechaFin) params = params.set('fechaFin', fechaFin);

    return this.http.get<any>(`${this.baseUrl}${API_ENDPOINTS.MODIFICATION.LIST_ALL}`, { params });
  }

  exportPdf(fechaInicio?: string, fechaFin?: string): Observable<Blob> {
    let params = new HttpParams();
    if (fechaInicio) params = params.set('fechaInicio', fechaInicio);
    if (fechaFin) params = params.set('fechaFin', fechaFin);

    return this.http.get(`${this.baseUrl}${API_ENDPOINTS.MODIFICATION.EXPORT_PDF}`, { 
      params, 
      responseType: 'blob' 
    });
  }
}
