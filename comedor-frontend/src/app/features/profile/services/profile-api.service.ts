import { inject, Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';

import { environment } from '@env/environment';
import { API_ENDPOINTS } from '@core/constants/api-endpoints';
import { ProfileStateService } from './profile-state.service';
import { Observable, of, tap } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class ProfileService {
  private apiUrl = environment.apiUrl;

  private readonly profileState = inject(ProfileStateService);

  constructor(private http: HttpClient) {}

  getPhone(): Observable<string> {
    const cachedPhone = this.profileState.phone();

    if (cachedPhone !== null) {
      return of(cachedPhone);
    }

    return this.http
      .get<string>(`${this.apiUrl}${API_ENDPOINTS.AUTH.PHONE}`, {
        withCredentials: true,
      })
      .pipe(
        tap((phone) => {
          this.profileState.setPhone(phone);
        }),
      );
  }

  updatePhone(): Observable<string> {
    return this.http
      .get<string>(`${this.apiUrl}${API_ENDPOINTS.AUTH.PHONE}`, {
        withCredentials: true,
      })
      .pipe(
        tap((phone) => {
          this.profileState.setPhone(phone);
        }),
      );
  }
}
