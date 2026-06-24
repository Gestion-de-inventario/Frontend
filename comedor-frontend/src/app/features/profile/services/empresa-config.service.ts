import { inject, Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { EmpresaConfig } from '../interfaces/empresa-config.interface';
import { environment } from '@env/environment'; 

@Injectable({
  providedIn: 'root'
})
export class EmpresaConfigService {
  private readonly http = inject(HttpClient);
  
  
  private readonly apiUrl = `${environment.apiUrl}/empresa-config`; 

  obtener(): Observable<EmpresaConfig> {
    return this.http.get<EmpresaConfig>(this.apiUrl);
  }

  actualizar(formData: FormData): Observable<EmpresaConfig> {
    return this.http.put<EmpresaConfig>(this.apiUrl, formData);
  }
}
