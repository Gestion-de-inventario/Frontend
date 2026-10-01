import { inject, Injectable, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, tap } from 'rxjs';
import { EmpresaConfig } from '../interfaces/empresa-config.interface';
import { environment } from '@env/environment';

@Injectable({
  providedIn: 'root',
})
export class EmpresaConfigService {
  private readonly http = inject(HttpClient);
  private readonly apiUrl = `${environment.apiUrl}/empresa-config`;
  readonly logoDataUrl = signal<string | null>(null);

  obtener(): Observable<EmpresaConfig> {
    return this.http
      .get<EmpresaConfig>(this.apiUrl)
      .pipe(tap((config) => this.updateLogo(config.logoBase64)));
  }

  actualizar(formData: FormData): Observable<EmpresaConfig> {
    return this.http
      .put<EmpresaConfig>(this.apiUrl, formData)
      .pipe(tap((config) => this.updateLogo(config.logoBase64)));
  }

  private updateLogo(logoBase64?: string): void {
    this.logoDataUrl.set(logoBase64 ? `data:image/png;base64,${logoBase64}` : null);
  }
}
