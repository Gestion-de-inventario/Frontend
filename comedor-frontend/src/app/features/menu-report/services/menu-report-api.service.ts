import { inject, Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from '@env/environment';
import { Observable } from 'rxjs';
import { MenuReportRequest } from '../interfaces/menu-report.request';
import { MenuReportResponse } from '../interfaces/menu-report.response';
import { MenuReportDetailResponse } from '../interfaces/menu-report.response';
import { BeneficiaryRecordRequest } from '@features/beneficiaries-control/interfaces/beneficiary-record-request';
import { BeneficiaryRecordResponse } from '@features/beneficiaries-control/interfaces/beneficiary-record-response';
import { DishMenuResponse } from '../interfaces/menu-report.response';
import { MenuReportSummaryResponse } from '@features/menu-report-summary/interfaces/menu-report-summary-response';

@Injectable({
  providedIn: 'root',
})
export class MenuReportApiService {
  private readonly http = inject(HttpClient);
  private readonly apiUrl = `${environment.apiUrl}/menu_report`;
  private readonly dishMenuUrl = `${environment.apiUrl}/dish-menus`;

  // Listar los platos disponibles
  getDishMenus(): Observable<DishMenuResponse[]> {
    return this.http.get<DishMenuResponse[]>(this.dishMenuUrl);
  }

  // Crear reporte enviando dishMenuId y quantityPrepared
  create(request: MenuReportRequest): Observable<MenuReportResponse> {
    return this.http.post<MenuReportResponse>(`${this.apiUrl}/create`, request);
  }

  // Buscar el reporte por fecha
  getByDate(fecha: string): Observable<MenuReportDetailResponse> {
    return this.http.get<MenuReportDetailResponse>(`${this.apiUrl}/date/${fecha}`);
  }

  // Resumen final
  getSummary(reporteId: number): Observable<MenuReportSummaryResponse> {
    return this.http.get<MenuReportSummaryResponse>(`${this.apiUrl}/${reporteId}/summary`);
  }
}
