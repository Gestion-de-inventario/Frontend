export interface DishMenuResponse {
  id: number;
  name: string;
  status: string;
  supplies: any[];
}

export interface CookResponse {
  id: number;
  name: string;
  lastname: string;
  dni: string;
}

export interface StockMovementResponse {
  id: number;
  productName: string;
  quantityUsed: number;
  unitCost: number;
  totalCost: number;
  movementDate: string;
}

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

export interface MenuReportSummaryResponse {
  totalEarned: number;
  totalSpent: number;
  neto: number;
  beneficiariosCount: number;
  mostUsedPaymentMethod: 'EFECTIVO' | 'YAPE' | 'PLIN';
}

export interface MenuReportDetailResponse {
  id: number;
  date: string;
  day: string;
  menu: string;
  quantityPrepared: number;
  quantityRemaining: number;
  status: string;
  cocineras: CookResponse[];
  registro: StockMovementResponse[];
  beneficiarios: BeneficiaryRecordResponse[];
  resumenReporteMenu: MenuReportSummaryResponse;
}

export interface MenuReportResponse {
  id: number;
  date: string;
  day: string;
  dishName: string;
  quantityPrepared: number;
  quantityRemaining: number;
  status: string;
}
