import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';

import { environment } from '@env/environment';
import { API_ENDPOINTS } from '@core/constants/api-endpoints';
import { AuthResponse } from '../interfaces/auth-response.interface';
import { AuthRequest } from '../interfaces/auth-request.interface';

@Injectable({
  providedIn: 'root',
})
export class AuthService {
  private apiUrl = environment.apiUrl;

  constructor(private http: HttpClient) {}

  login(request: AuthRequest) {
    return this.http.post<AuthResponse>(`${this.apiUrl}${API_ENDPOINTS.AUTH.LOGIN}`, request, {
      withCredentials: true,
    });
  }
  refresh() {
    return this.http.post<AuthResponse>(
      `${this.apiUrl}${API_ENDPOINTS.AUTH.REFRESH}`,
      {},
      { withCredentials: true },
    );
  }

  logout() {
    return this.http.post<AuthResponse>(
      `${this.apiUrl}${API_ENDPOINTS.AUTH.LOGOUT}`,
      {},
      { withCredentials: true },
    );
  }

  me() {
    return this.http.get<AuthResponse>(`${this.apiUrl}${API_ENDPOINTS.AUTH.ME}`, {
      withCredentials: true,
    });
  }
}
