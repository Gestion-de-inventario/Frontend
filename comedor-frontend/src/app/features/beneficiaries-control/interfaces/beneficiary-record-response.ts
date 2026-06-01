export interface BeneficiaryRecordResponse {
  id: number;
  name: string;
  lastName: string;
  cantidad: number;
  total: number;
  metodoPago: 'EFECTIVO' | 'YAPE' | 'PLIN';
  pago: boolean;
  entregado: boolean;
}
