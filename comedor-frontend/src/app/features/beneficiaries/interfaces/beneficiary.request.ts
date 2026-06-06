export interface BeneficiaryRequest {
  dni: string;
  name: string;
  lastname: string;
}

export interface EditBeneficiaryRequest {
  dni?: string;
  name?: string;
  lastname?: string;
  beneficiaryTypeId?: number;
}
