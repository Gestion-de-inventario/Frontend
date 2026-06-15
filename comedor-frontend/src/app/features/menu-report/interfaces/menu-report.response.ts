import { BeneficiaryRecordResponse } from '@features/beneficiaries-control/interfaces/beneficiary-record-response';
import { MenuReportSummaryResponse } from '@features/menu-report-summary/interfaces/menu-report-summary-response';

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
  productUnit: string;
  quantityUsed: number;
  unitCost: number;
  totalCost: number;
  movementDate: string;
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
  dishId: number;
  dishName: string;
  registers: StockMovementResponse[];
  beneficiaries: BeneficiaryRecordResponse[];
  quantityPrepared: number;
  quantityRemaining: number;
  status: string;
}

export interface ListMenuReportDetailResponse {
  reports: MenuReportDetailResponse[];
  totalEarned: number;
  totalSpent: number;
  net: number;
  uniqueBeneficiaryCount: number;
  mostUsedPaymentMethod: 'EFECTIVO' | 'YAPE' | 'PLIN';
}
