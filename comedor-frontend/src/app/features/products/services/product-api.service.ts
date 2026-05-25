import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { environment } from '@env/environment';
import { API_ENDPOINTS } from '@core/constants/api-endpoints';
import { ProductResponse } from '../interfaces/product.response';
import { ProductRequest } from '../interfaces/product.request';

@Injectable({
  providedIn: 'root',
})
export class ProductApiService {
  private apiUrl = environment.apiUrl;

  constructor(private http: HttpClient) {}

  listByStatus(status?: string) {
    let params = new HttpParams();
    if (status) params = params.set('estado', status);
    return this.http.get<ProductResponse[]>(`${this.apiUrl}${API_ENDPOINTS.PRODUCT.LIST_BY_STATUS}`, { params });
  }

  create(request: ProductRequest) {
    return this.http.post<ProductResponse>(`${this.apiUrl}${API_ENDPOINTS.PRODUCT.CREATE}`, request);
  }

  edit(id: number, request: Partial<ProductRequest>) {
    return this.http.put<ProductResponse>(
      `${this.apiUrl}${API_ENDPOINTS.PRODUCT.EDIT.replace('{id}', id.toString())}`,
      request,
    );
  }

  changeStatus(id: number, status: string) {
    return this.http.post<ProductResponse>(
      `${this.apiUrl}${API_ENDPOINTS.PRODUCT.CHANGE_STATUS.replace('{id}', id.toString())}`,
      null,
      { params: new HttpParams().set('estado', status) }
    );
  }
}