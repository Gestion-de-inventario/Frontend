import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';

import { environment } from '@env/environment';
import { API_ENDPOINTS } from '@core/constants/api-endpoints';
import { RoleResponse } from '../interfaces/role.response';
import { CreateRoleRequest } from '../interfaces/role.create.request';
import { MinRoleResponse } from '../interfaces/min.role.response';
import { RoleEditRequest } from '../interfaces/role.edit.request';
import { buildEndpoint } from '@shared/utils/api.utils';
import { PermissionsAssignmentRequest } from '../interfaces/permissions.asigment.request';
@Injectable({
  providedIn: 'root',
})
export class RoleService {
  private apiUrl = environment.apiUrl;

  constructor(private http: HttpClient) {}

  listRolesByStatus(status: string) {
    return this.http.get<RoleResponse[]>(
      `${this.apiUrl}${API_ENDPOINTS.ROLE.LIST_BY_STATUS}?status=${status}`,
    );
  }
  listMinRolesByStatus(status: string) {
    return this.http.get<MinRoleResponse[]>(
      `${this.apiUrl}${API_ENDPOINTS.ROLE.LIST_BY_STATUS}?status=${status}`,
    );
  }

  getRoleById(id: number) {
    const endpoint = buildEndpoint(API_ENDPOINTS.ROLE.GET_BY_ID, { id });
    return this.http.get<RoleResponse>(`${this.apiUrl}${endpoint}`);
  }

  createRole(request: CreateRoleRequest) {
    return this.http.post<RoleResponse>(`${this.apiUrl}${API_ENDPOINTS.ROLE.CREATE}`, request);
  }

  editRole(id: number, request: RoleEditRequest) {
    const endpoint = buildEndpoint(API_ENDPOINTS.ROLE.EDIT, { id });
    return this.http.put<RoleResponse>(`${this.apiUrl}${endpoint}`, request);
  }

  assignPermissions(roleId: number, request: PermissionsAssignmentRequest) {
    const endpoint = buildEndpoint(API_ENDPOINTS.ROLE.ASSIGN_PERMISSIONS, { id: roleId });
    return this.http.put<RoleResponse>(`${this.apiUrl}${endpoint}`, request);
  }

  changeStatus(roleId: number, status: string) {
    const endpoint = buildEndpoint(API_ENDPOINTS.ROLE.CHANGE_STATUS, { id: roleId });

    return this.http.put<RoleResponse>(`${this.apiUrl}${endpoint}?status=${status}`, {});
  }
}
