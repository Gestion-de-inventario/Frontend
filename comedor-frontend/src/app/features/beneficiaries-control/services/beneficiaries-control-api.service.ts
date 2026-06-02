import { inject, Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from '@env/environment';
import { Observable } from 'rxjs';
import { BeneficiaryRecordRequest } from '@features/beneficiaries-control/interfaces/beneficiary-record-request';
import { BeneficiaryRecordResponse } from '@features/beneficiaries-control/interfaces/beneficiary-record-response';

@Injectable({
  providedIn: 'root',
})
export class BeneficiaryControlApiService {
  private readonly http = inject(HttpClient);
  private readonly apiUrl = `${environment.apiUrl}/menu_report`;

  // Agregar beneficiario
  addBeneficiary(
    reporteId: number,
    dto: BeneficiaryRecordRequest,
  ): Observable<BeneficiaryRecordResponse> {
    return this.http.post<BeneficiaryRecordResponse>(
      `${this.apiUrl}/${reporteId}/beneficiaries`,
      dto,
    );
  }

  // Editar beneficiario usando controlId (PATCH)
  editBeneficiary(
    reporteId: number,
    controlId: number,
    dto: BeneficiaryRecordRequest,
  ): Observable<BeneficiaryRecordResponse> {
    return this.http.patch<BeneficiaryRecordResponse>(
      `${this.apiUrl}/${reporteId}/beneficiaries/${controlId}`,
      dto,
    );
  }

  // Eliminar beneficiario usando controlId (DELETE)
  removeBeneficiary(reporteId: number, controlId: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${reporteId}/beneficiaries/${controlId}`);
  }
}
