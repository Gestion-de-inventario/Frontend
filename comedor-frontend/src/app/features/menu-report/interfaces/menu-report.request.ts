export interface MenuReportRequest {
  dishMenuId: number;         
  quantityPrepared: number;   
  cooks: number[];
}

export interface BeneficiaryRecordRequest {
  beneficiarioId: number;
  pago: boolean;
  entregado: boolean;
  payMethod: 'EFECTIVO' | 'YAPE' | 'PLI';
  menusAmount: number;
  menuPrice: number;
}