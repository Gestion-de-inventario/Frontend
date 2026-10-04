import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';

import { environment } from '@env/environment';
import { API_ENDPOINTS } from '@core/constants/api-endpoints';
import { AuthResponse } from '../interfaces/auth-response.interface';
import { AuthRequest } from '../interfaces/auth-request.interface';
import {
  ForgotPasswordRequest,
  ResetPasswordRequest,
  ValidateTokenResponse,
  GenericAuthResponse,
} from '../interfaces/password-reset.interface';
import { Observable } from 'rxjs/internal/Observable';

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

  requestPasswordReset(payload: ForgotPasswordRequest): Observable<GenericAuthResponse> {
    return this.http.post<GenericAuthResponse>(
      `${this.apiUrl}${API_ENDPOINTS.AUTH.FORGOT_PASSWORD_REQUEST}`,
      payload,
    );
  }

  validateResetToken(token: string): Observable<ValidateTokenResponse> {
    return this.http.get<ValidateTokenResponse>(
      `${this.apiUrl}${API_ENDPOINTS.AUTH.VALIDATE_RESET_TOKEN}`,
      { params: { token } },
    );
  }

  confirmPasswordReset(payload: ResetPasswordRequest): Observable<GenericAuthResponse> {
    return this.http.post<GenericAuthResponse>(
      `${this.apiUrl}${API_ENDPOINTS.AUTH.RESET_PASSWORD_CONFIRM}`,
      payload,
    );
  }
}
