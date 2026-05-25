import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';

import { environment } from '@env/environment';
import { API_ENDPOINTS } from '@core/constants/api-endpoints';
import { PermissionResponse } from '../interfaces/permission.response';
@Injectable({
  providedIn: 'root',
})
export class PermissionService {
  private apiUrl = environment.apiUrl;

  constructor(private http: HttpClient) {}

  getAllPermissions() {
    return this.http.get<PermissionResponse[]>(
      `${this.apiUrl}${API_ENDPOINTS.PERMISSION.LIST_ALL}`,
    );
  }
}
