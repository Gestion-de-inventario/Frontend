import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';

import { environment } from '@env/environment';
import { API_ENDPOINTS } from '@core/constants/api-endpoints';
import { UserResponse } from '../interfaces/user.response';
import { UserRequest } from '../interfaces/user.request';
import { buildEndpoint } from '@shared/utils/api.utils';
import { EditProfileRequest } from '@features/profile/interfaces/edit-profile.request';
import { ChangePasswordRequest } from '@features/profile/interfaces/change-password.request';
import { ForceChangePasswordRequest } from '../interfaces/force.change.password.request';

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
    return this.http.put<UserResponse>(`${this.apiUrl}${endpoint}`, request);
  }

  changePasswordUser(id: number, request: ForceChangePasswordRequest) {
    const endpoint = buildEndpoint(API_ENDPOINTS.USER.CHANGE_PASSWORD, { id });
    return this.http.put<{ mensaje: string }>(`${this.apiUrl}${endpoint}`, request);
  }

  deactivateUser(id: number) {
    const endpoint = buildEndpoint(API_ENDPOINTS.USER.DEACTIVATE, { id });
    return this.http.post<UserResponse>(`${this.apiUrl}${endpoint}`, {});
  }

  activateUser(id: number) {
    const endpoint = buildEndpoint(API_ENDPOINTS.USER.ACTIVATE, { id });
    return this.http.post<UserResponse>(`${this.apiUrl}${endpoint}`, {});
  }

  editMyProfile(request: EditProfileRequest) {
    return this.http.put<UserResponse>(`${this.apiUrl}/user/me/edit`, request);
  }

  changeMyPassword(request: ChangePasswordRequest) {
    return this.http.put<{ mensaje: string }>(`${this.apiUrl}/user/me/change-password`, request);
  }
}
