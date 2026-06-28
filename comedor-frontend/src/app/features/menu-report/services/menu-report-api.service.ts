import { inject, Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { environment } from '@env/environment';
import { Observable } from 'rxjs';
import { EditMenuReportRequest, MenuReportRequest } from '../interfaces/menu-report.request';
import {
  ListMenuReportDetailResponse,
  MenuReportResponse,
} from '../interfaces/menu-report.response';

import { DishMenuResponse } from '../interfaces/menu-report.response';
import { buildEndpoint } from '@shared/utils/api.utils';
import { MenuPageResponse } from '@features/menu-report-summary/interfaces/menu-report-page.response';
import { API_ENDPOINTS } from '@core/constants/api-endpoints';

@Injectable({
  providedIn: 'root',
})
export class MenuReportApiService {
  private readonly http = inject(HttpClient);
  private readonly baseUrl = `${environment.apiUrl}`;

  getDishMenus(): Observable<DishMenuResponse[]> {
    return this.http.get<DishMenuResponse[]>(`${this.baseUrl}${API_ENDPOINTS.DISH_MENU.LIST_ALL}`);
  }

  // Crear reporte enviando dishMenuId y quantityPrepared
  create(request: MenuReportRequest): Observable<MenuReportResponse> {
    return this.http.post<MenuReportResponse>(
      `${this.baseUrl}${API_ENDPOINTS.MENU_REPORT.CREATE}`,
      request,
    );
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

    return this.http.get<ListMenuReportDetailResponse>(
      `${this.baseUrl}${API_ENDPOINTS.MENU_REPORT.GET_BY_DATE}`,
      {
        params,
      },
    );
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

    return this.http.get<MenuPageResponse>(`${this.baseUrl}${API_ENDPOINTS.MENU_REPORT.LIST}`, {
      params,
    });
  }

  //Obtener ReporteMenu por id
  getMenuReportById(id: number) {
    const endpoint = buildEndpoint(API_ENDPOINTS.MENU_REPORT.GET_BY_ID, { id });
    return this.http.get<MenuReportResponse>(`${this.baseUrl}${endpoint}`, {});
  }

  exportPdf(startDate?: string, endDate?: string): Observable<Blob> {
    let params = new HttpParams();

    if (startDate) {
      params = params.set('startDate', startDate);
    }

    if (endDate) {
      params = params.set('endDate', endDate);
    }

    return this.http.get(`${this.baseUrl}${API_ENDPOINTS.MENU_REPORT.RANGE_EXPORT_PDF}`, {
      params,
      responseType: 'blob',
    });
  }

  exportExcel(startDate?: string, endDate?: string): Observable<Blob> {
    let params = new HttpParams();

    if (startDate) {
      params = params.set('startDate', startDate);
    }

    if (endDate) {
      params = params.set('endDate', endDate);
    }

    return this.http.get(`${this.baseUrl}${API_ENDPOINTS.MENU_REPORT.RANGE_EXPORT_EXPORT_EXCEL}`, {
      params,
      responseType: 'blob',
    });
  }

  editMenuReport(id: number, request: EditMenuReportRequest): Observable<MenuReportResponse> {
    const endpoint = buildEndpoint(API_ENDPOINTS.MENU_REPORT.EDIT, { id });
    return this.http.put<MenuReportResponse>(`${this.baseUrl}${endpoint}`, request);
  }
}
