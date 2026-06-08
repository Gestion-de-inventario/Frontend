import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { environment } from '@env/environment';
import { API_ENDPOINTS } from '@core/constants/api-endpoints';
import { DishMenuResponse } from '../interfaces/dish-menu.response';
import { CreateDishMenuRequest, EditDishMenuRequest } from '../interfaces/dish-menu.request';

@Injectable({ providedIn: 'root' })
export class DishApiService {
  private apiUrl = environment.apiUrl;

  constructor(private http: HttpClient) {}

  listAll() {
    return this.http.get<DishMenuResponse[]>(`${this.apiUrl}${API_ENDPOINTS.DISH_MENU.LIST_ALL}`);
  }

  create(request: CreateDishMenuRequest) {
    return this.http.post<DishMenuResponse>(`${this.apiUrl}${API_ENDPOINTS.DISH_MENU.CREATE}`, request);
  }

  edit(id: number, request: EditDishMenuRequest) {
    return this.http.put<DishMenuResponse>(
      `${this.apiUrl}${API_ENDPOINTS.DISH_MENU.EDIT.replace('{id}', id.toString())}`,
      request
    );
  }

  changeStatus(id: number, status: string) {
    return this.http.post<DishMenuResponse>(
      `${this.apiUrl}${API_ENDPOINTS.DISH_MENU.CHANGE_STATUS.replace('{id}', id.toString())}`,
      null,
      { params: new HttpParams().set('estado', status) }
    );
  }
}