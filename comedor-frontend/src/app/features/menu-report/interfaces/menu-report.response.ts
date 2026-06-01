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
  dishName: string;
  quantityPrepared: number;
  quantityRemaining: number;
  status: string;
}
