export interface MenuReportSummaryResponse {
  totalEarned: number;
  totalSpent: number;
  neto: number;
  beneficiariosCount: number;
  mostUsedPaymentMethod: 'EFECTIVO' | 'YAPE' | 'PLIN';
}
