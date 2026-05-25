export interface MenuReportRequest {
  menu: string;
  cooks: number[];
}

export interface ProductRecordRequest {
  productoId: number;
  amount: number;
  productSource: 'DONACION' | 'COMPRA';
  unitPrice: number;
}

export interface BeneficiaryRecordRequest {
  beneficiarioId: number;
  pago: boolean;
  entregado: boolean;
  payMethod: 'EFECTIVO' | 'YAPE' | 'PLI';
  menusAmount: number;
  menuPrice: number;
}