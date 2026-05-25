import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { environment } from '@env/environment';
import { API_ENDPOINTS } from '@core/constants/api-endpoints';
import { TagResponse } from '../interfaces/tag.response';
import { TagRequest } from '../interfaces/tag.request';

@Injectable({
  providedIn: 'root',
})
export class TagApiService {
  private apiUrl = environment.apiUrl;

  constructor(private http: HttpClient) {}

  listByStatus(status?: string) {
    let params = new HttpParams();
    if (status) params = params.set('estado', status);
    return this.http.get<TagResponse[]>(
      `${this.apiUrl}${API_ENDPOINTS.TAG.LIST_BY_STATUS}`,
      { params }
    );
  }

  create(request: TagRequest) {
    return this.http.post<TagResponse>(
      `${this.apiUrl}${API_ENDPOINTS.TAG.CREATE}`,
      request
    );
  }

  changeStatus(id: number, status: string) {
    return this.http.post<TagResponse>(
      `${this.apiUrl}${API_ENDPOINTS.TAG.CHANGE_STATUS.replace('{id}', id.toString())}`,
      null,
      { params: new HttpParams().set('estado', status) }
    );
  }
}