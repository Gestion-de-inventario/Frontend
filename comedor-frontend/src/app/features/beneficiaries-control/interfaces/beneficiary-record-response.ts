export interface BeneficiaryRecordResponse {
  id: number;
  beneficiaryId: number;
  name: string;
  lastName: string;
  cantidad: number;
  total: number;
  paymentMethod: string;
  pago: boolean;
  entregado: boolean;
}
