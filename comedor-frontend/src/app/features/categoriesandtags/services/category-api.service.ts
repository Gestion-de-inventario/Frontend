import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { environment } from '@env/environment';
import { API_ENDPOINTS } from '@core/constants/api-endpoints';
import { CategoryResponse } from '../interfaces/category.response';
import { CategoryRequest } from '../interfaces/category.request';

@Injectable({
  providedIn: 'root',
})
export class CategoryApiService {
  private apiUrl = environment.apiUrl;

  constructor(private http: HttpClient) {}

  listByStatus(status?: string) {
    let params = new HttpParams();
    if (status) params = params.set('estado', status);
    return this.http.get<CategoryResponse[]>(
      `${this.apiUrl}${API_ENDPOINTS.CATEGORY.LIST_BY_STATUS}`,
      { params }
    );
  }

  create(request: CategoryRequest) {
    return this.http.post<CategoryResponse>(
      `${this.apiUrl}${API_ENDPOINTS.CATEGORY.CREATE}`,
      request
    );
  }

  changeStatus(id: number, status: string) {
    return this.http.post<CategoryResponse>(
      `${this.apiUrl}${API_ENDPOINTS.CATEGORY.CHANGE_STATUS.replace('{id}', id.toString())}`,
      null,
      { params: new HttpParams().set('estado', status) }
    );
  }
}