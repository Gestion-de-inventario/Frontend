import { inject, Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { environment } from '@env/environment';
import { Observable } from 'rxjs';
import { MenuReportRequest } from '../interfaces/menu-report.request';
import {
  ListMenuReportDetailResponse,
  MenuReportResponse,
} from '../interfaces/menu-report.response';
import { MenuReportDetailResponse } from '../interfaces/menu-report.response';
import { BeneficiaryRecordRequest } from '@features/beneficiaries-control/interfaces/beneficiary-record-request';
import { BeneficiaryRecordResponse } from '@features/beneficiaries-control/interfaces/beneficiary-record-response';
import { DishMenuResponse } from '../interfaces/menu-report.response';
import { MenuReportSummaryResponse } from '@features/menu-report-summary/interfaces/menu-report-summary-response';
import { MenuPageResponse } from '@features/menu-report-summary/interfaces/menu-report-page.response';

@Injectable({
  providedIn: 'root',
})
export class MenuReportApiService {
  private readonly http = inject(HttpClient);
  private readonly apiUrl = `${environment.apiUrl}/menu_report`;
  private readonly dishMenuUrl = `${environment.apiUrl}/dish-menus`;

  getDishMenus(): Observable<DishMenuResponse[]> {
    return this.http.get<DishMenuResponse[]>(this.dishMenuUrl);
  }

  // Crear reporte enviando dishMenuId y quantityPrepared
  create(request: MenuReportRequest): Observable<MenuReportResponse> {
    return this.http.post<MenuReportResponse>(`${this.apiUrl}/create`, request);
  }

  // Lista reporte entero
  getByDate(startDate?: string, endDate?: string): Observable<ListMenuReportDetailResponse> {
    let params = new HttpParams();

    if (startDate) {
      params = params.set('startDate', startDate);
    }

    if (endDate) {
      params = params.set('endDate', endDate);
    }

    return this.http.get<ListMenuReportDetailResponse>(`${this.apiUrl}/detail/list`, { params });
  }

  // lista ligera pageable
  list(page = 0, size = 20, startDate?: string, endDate?: string) {
    let params = new HttpParams().set('page', page).set('size', size);
    if (startDate) {
      params = params.set('startDate', startDate);
    }

    if (endDate) {
      params = params.set('endDate', endDate);
    }

    return this.http.get<MenuPageResponse>(`${this.apiUrl}/list`, { params });
  }
}
