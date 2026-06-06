export interface BeneficiaryResponse {
  id: number;
  dni: string;
  name: string;
  lastname: string;
  beneficiaryTypeId: number;
  beneficiaryType: string;
  menu_cost: number;
  status: string;
}

export interface DatosPersonalesResponse {
  dni: string;
  names: string;
  lastnames: string;
}
