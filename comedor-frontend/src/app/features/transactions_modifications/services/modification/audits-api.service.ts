import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';

import { Observable } from 'rxjs';

import { environment } from '@env/environment';
import { API_ENDPOINTS } from '@core/constants/api-endpoints';

@Injectable({
  providedIn: 'root',
})
export class AuditsService {
  private readonly baseUrl = environment.apiUrl;

  constructor(private http: HttpClient) {}

  getAudits(page: number, size: number, fechaInicio?: string, fechaFin?: string): Observable<any> {
    let params = new HttpParams().set('page', page.toString()).set('size', size.toString());

    if (fechaInicio) params = params.set('fechaInicio', fechaInicio);
    if (fechaFin) params = params.set('fechaFin', fechaFin);

    return this.http.get<any>(`${this.baseUrl}${API_ENDPOINTS.AUDIT.LIST_ALL}`, { params });
  }

  exportPdf(fechaInicio?: string, fechaFin?: string): Observable<Blob> {
    let params = new HttpParams();
    if (fechaInicio) params = params.set('fechaInicio', fechaInicio);
    if (fechaFin) params = params.set('fechaFin', fechaFin);

    return this.http.get(`${this.baseUrl}${API_ENDPOINTS.AUDIT.EXPORT_PDF}`, {
      params,
      responseType: 'blob',
    });
  }
}
