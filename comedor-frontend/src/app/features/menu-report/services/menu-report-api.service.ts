import { inject, Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from '@env/environment';
import { Observable } from 'rxjs';
import { MenuReportRequest } from '../interfaces/menu-report.request';
import { MenuReportResponse } from '../interfaces/menu-report.response';
import { MenuReportDetailResponse } from '../interfaces/menu-report.response';
import { BeneficiaryRecordRequest } from '../interfaces/menu-report.request';
import { BeneficiaryRecordResponse } from '../interfaces/menu-report.response';
import { DishMenuResponse } from '../interfaces/menu-report.response';
import { MenuReportSummaryResponse } from '../interfaces/menu-report.response';

@Injectable({
  providedIn: 'root'
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

  // Agregar beneficiario
  addBeneficiary(reporteId: number, dto: BeneficiaryRecordRequest): Observable<BeneficiaryRecordResponse> {
    return this.http.post<BeneficiaryRecordResponse>(`${this.apiUrl}/${reporteId}/beneficiaries`, dto);
  }

  // Editar beneficiario usando controlId (PATCH)
  editBeneficiary(reporteId: number, controlId: number, dto: BeneficiaryRecordRequest): Observable<BeneficiaryRecordResponse> {
    return this.http.patch<BeneficiaryRecordResponse>(`${this.apiUrl}/${reporteId}/beneficiaries/${controlId}`, dto);
  }

  // Eliminar beneficiario usando controlId (DELETE)
  removeBeneficiary(reporteId: number, controlId: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${reporteId}/beneficiaries/${controlId}`);
  }

  // Resumen final
  getSummary(reporteId: number): Observable<MenuReportSummaryResponse> {
    return this.http.get<MenuReportSummaryResponse>(`${this.apiUrl}/${reporteId}/summary`);
  }
}