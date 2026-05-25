export interface MenuReportResponse {
  id: number;
  date: string;
  day: string;
}

export interface ProductRecordResponse {
  productoId: number;
  productName: string;
  productCategory: string;
  productUnit: string;
  sourceProduct: 'DONACION' | 'COMPRA';
  amount: number;
  spentAmount: number;
}

export interface BeneficiaryRecordResponse {
  name: string;
  lastName: string;
  cantidad: number;
  total: number;
  metodoPago: 'EFECTIVO' | 'YAPE' | 'PLI';
  pago: boolean;
  entregado: boolean;
}

export interface CookResponse {
  id: number;
  name: string;
  lastname: string;
  dni: string;
}

export interface MenuReportDetailResponse {
  id: number;
  date: string;
  day: string;
  menu: string;
  cocineras: CookResponse[];
  registro: ProductRecordResponse[];
  beneficiarios: BeneficiaryRecordResponse[];
  resumenReporteMenu: MenuReportSummaryResponse;
}

export interface MenuReportSummaryResponse {
  totalEarned: number;
  totalSpent: number;
  neto: number;
  beneficiariosCount: number;
  mostUsedPaymentMethod: 'EFECTIVO' | 'YAPE' | 'PLIN';
}