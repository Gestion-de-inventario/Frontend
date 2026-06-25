export interface BeneficiaryRecordRequest {
  beneficiarioId: number;
  pago: boolean;
  entregado: boolean;
  payMethod: string;
  menusAmount: number;
  menuPrice: number;
}
