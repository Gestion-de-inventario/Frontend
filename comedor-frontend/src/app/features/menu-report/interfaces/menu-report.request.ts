export interface MenuReportRequest {
  dishMenuId: number;
  quantityPrepared: number;
  cooks: number[];
}

export interface BeneficiaryRecordRequest {
  beneficiarioId: number;
  pago: boolean;
  entregado: boolean;
  payMethod: 'EFECTIVO' | 'YAPE' | 'PLIN';
  menusAmount: number;
  menuPrice: number;
}
