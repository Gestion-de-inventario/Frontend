import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';

import { environment } from '@env/environment';
import { API_ENDPOINTS } from '@core/constants/api-endpoints';
import { UserResponse } from '../interfaces/user.response';
import { UserRequest } from '../interfaces/user.request';
import { buildEndpoint } from '@shared/utils/api.utils';

@Injectable({
  providedIn: 'root',
})
export class UserService {
  private apiUrl = environment.apiUrl;

  constructor(private http: HttpClient) {}

  listUsers() {
    return this.http.get<UserResponse[]>(`${this.apiUrl}${API_ENDPOINTS.USER.LIST_ALL}`);
  }

  listActiveUsers() {
    return this.http.get<UserResponse[]>(`${this.apiUrl}${API_ENDPOINTS.USER.LIST_ACTIVE}`);
  }

  createUser(request: UserRequest) {
    return this.http.post<UserResponse>(`${this.apiUrl}${API_ENDPOINTS.USER.CREATE}`, request);
  }

  editUser(id: number, request: UserRequest) {
    const endpoint = buildEndpoint(API_ENDPOINTS.USER.EDIT, { id });
    return this.http.post<UserResponse>(`${this.apiUrl}${endpoint}`, request);
  }

  deactivateUser(id: number) {
    const endpoint = buildEndpoint(API_ENDPOINTS.USER.DEACTIVATE, { id });
    return this.http.post<UserResponse>(`${this.apiUrl}${endpoint}`, {});
  }

  activateUser(id: number) {
    const endpoint = buildEndpoint(API_ENDPOINTS.USER.ACTIVATE, { id });
    return this.http.post<UserResponse>(`${this.apiUrl}${endpoint}`, {});
  }
}
