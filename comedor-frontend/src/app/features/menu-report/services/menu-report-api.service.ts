import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from '@env/environment';
import { API_ENDPOINTS } from '@core/constants/api-endpoints';
import {
  MenuReportRequest,
  ProductRecordRequest,
  BeneficiaryRecordRequest,
} from '../interfaces/menu-report.request';
import {
  MenuReportResponse,
  MenuReportDetailResponse,
  ProductRecordResponse,
  BeneficiaryRecordResponse,
  MenuReportSummaryResponse,
} from '../interfaces/menu-report.response';

@Injectable({
  providedIn: 'root',
})
export class MenuReportApiService {
  private apiUrl = environment.apiUrl;

  constructor(private http: HttpClient) {}

  create(request: MenuReportRequest) {
    return this.http.post<MenuReportResponse>(
      `${this.apiUrl}${API_ENDPOINTS.MENU_REPORT.CREATE}`,
      request
    );
  }

  getByDate(date: string) {
    return this.http.get<MenuReportDetailResponse>(
      `${this.apiUrl}${API_ENDPOINTS.MENU_REPORT.GET_BY_DATE.replace('{fecha}', date)}`
    );
  }

  getSummary(id: number) {
    return this.http.get<MenuReportSummaryResponse>(
      `${this.apiUrl}${API_ENDPOINTS.MENU_REPORT.GET_SUMMARY.replace('{id}', id.toString())}`
    );
  }

  addProduct(id: number, request: ProductRecordRequest) {
    return this.http.post<ProductRecordResponse>(
      `${this.apiUrl}${API_ENDPOINTS.MENU_RECORD.ADD_PRODUCT.replace('{id}', id.toString())}`,
      request
    );
  }

  editProduct(reporteId: number, registroId: number, request: ProductRecordRequest) {
    return this.http.patch<ProductRecordResponse>(
      `${this.apiUrl}${API_ENDPOINTS.MENU_RECORD.EDIT_PRODUCT
        .replace('{reporteId}', reporteId.toString())
        .replace('{registroId}', registroId.toString())}`,
      request
    );
  }

  removeProduct(reporteId: number, registroId: number) {
    return this.http.delete<void>(
      `${this.apiUrl}${API_ENDPOINTS.MENU_RECORD.REMOVE_PRODUCT
        .replace('{reporteId}', reporteId.toString())
        .replace('{registroId}', registroId.toString())}`
    );
  }

  addBeneficiary(id: number, request: BeneficiaryRecordRequest) {
    return this.http.post<BeneficiaryRecordResponse>(
      `${this.apiUrl}${API_ENDPOINTS.MENU_RECORD.ADD_BENEFICIARY.replace('{id}', id.toString())}`,
      request
    );
  }

  editBeneficiary(reporteId: number, controlId: number, request: BeneficiaryRecordRequest) {
    return this.http.patch<BeneficiaryRecordResponse>(
      `${this.apiUrl}${API_ENDPOINTS.MENU_RECORD.EDIT_BENEFICIARY
        .replace('{reporteId}', reporteId.toString())
        .replace('{controlId}', controlId.toString())}`,
      request
    );
  }

  removeBeneficiary(reporteId: number, controlId: number) {
    return this.http.delete<void>(
      `${this.apiUrl}${API_ENDPOINTS.MENU_RECORD.REMOVE_BENEFICIARY
        .replace('{reporteId}', reporteId.toString())
        .replace('{controlId}', controlId.toString())}`
    );
  }
}