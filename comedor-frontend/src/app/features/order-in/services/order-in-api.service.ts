import { Injectable } from '@angular/core';
import { environment } from '@env/environment';
import { Observable } from 'rxjs';
import { HttpClient, HttpParams } from '@angular/common/http';
import { API_ENDPOINTS } from '@core/constants/api-endpoints';
import { OrderSource } from '../interfaces/order.source';
import { OrderInPageResponse } from '../interfaces/list-orders-in/order-in-page.response';

@Injectable({
  providedIn: 'root',
})
export class OrderInApiService {
  private readonly baseUrl = environment.apiUrl;

  constructor(private readonly http: HttpClient) {}

  list(
    page: number = 0,
    size: number = 20,
    startDate?: string,
    endDate?: string,
    source?: OrderSource,
    status?: string,
  ): Observable<OrderInPageResponse> {
    let params = new HttpParams().set('page', page.toString()).set('size', size.toString());

    if (startDate) {
      params = params.set('startDate', startDate);
    }

    if (endDate) {
      params = params.set('endDate', endDate);
    }

    if (source) {
      params = params.set('source', source);
    }

    if (status) {
      params = params.set('status', status);
    }

    return this.http.get<OrderInPageResponse>(`${this.baseUrl}${API_ENDPOINTS.ORDER_IN.LIST_ALL}`, {
      params,
    });
  }
}
