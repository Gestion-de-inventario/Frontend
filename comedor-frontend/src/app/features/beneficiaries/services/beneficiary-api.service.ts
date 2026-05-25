import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { environment } from '@env/environment';
import { API_ENDPOINTS } from '@core/constants/api-endpoints';
import { BeneficiaryResponse } from '../interfaces/beneficiary.response';
import { BeneficiaryRequest, EditBeneficiaryRequest } from '../interfaces/beneficiary.request';

@Injectable({
  providedIn: 'root',
})
export class BeneficiaryApiService {
  private apiUrl = environment.apiUrl;

  constructor(private http: HttpClient) {}

  listByStatus(status?: string) {
    let params = new HttpParams();
    if (status) params = params.set('estado', status);
    return this.http.get<BeneficiaryResponse[]>(
      `${this.apiUrl}${API_ENDPOINTS.BENEFICIARY.LIST_BY_STATUS}`,
      { params }
    );
  }

  searchByDni(dni: string) {
    return this.http.get<BeneficiaryResponse>(
      `${this.apiUrl}${API_ENDPOINTS.BENEFICIARY.SEARCH_BY_DNI.replace('{dni}', dni)}`
    );
  }

  searchByDniReniec(dni: string) {
    return this.http.get<any>(
      `${this.apiUrl}${API_ENDPOINTS.BENEFICIARY.SEARCH_BY_DNI_RENIEC.replace('{dni}', dni)}`
    );
  }

  createManual(request: BeneficiaryRequest) {
    return this.http.post<BeneficiaryResponse>(
      `${this.apiUrl}${API_ENDPOINTS.BENEFICIARY.CREATE}`,
      request
    );
  }

  createByDni(dni: string) {
    return this.http.post<BeneficiaryResponse>(
      `${this.apiUrl}${API_ENDPOINTS.BENEFICIARY.CREATE_BY_DNI.replace('{dni}', dni)}`,
      {}
    );
  }

  edit(id: number, request: EditBeneficiaryRequest) {
    return this.http.put<BeneficiaryResponse>(
      `${this.apiUrl}${API_ENDPOINTS.BENEFICIARY.EDIT.replace('{id}', id.toString())}`,
      request
    );
  }
}