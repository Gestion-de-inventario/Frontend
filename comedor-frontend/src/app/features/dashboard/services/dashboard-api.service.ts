import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from 'src/environments/environment'; // Ajusta la ruta a tu env
import { API_ENDPOINTS } from 'src/app/core/constants/api-endpoints'; // Ajusta la ruta
import { DashboardResponse } from '../interfaces/dashboard.response';

@Injectable({
  providedIn: 'root'
})
export class DashboardApiService {

  private readonly URL = `${environment.apiUrl}${API_ENDPOINTS.DASHBOARD.GET_SUMMARY}`;

  constructor(private http: HttpClient) { }

  getDashboardData(anio?: number, mes?: number): Observable<DashboardResponse> {
    let params = new HttpParams();
    
    if (anio) {
      params = params.set('anio', anio.toString());
    }
    if (mes) {
      params = params.set('mes', mes.toString());
    }

    return this.http.get<DashboardResponse>(this.URL, { params });
  }
}