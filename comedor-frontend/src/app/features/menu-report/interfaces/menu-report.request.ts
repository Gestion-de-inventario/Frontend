export interface MenuReportRequest {
  dishMenuId: number;
  quantityPrepared: number;
  cooks: number[];
}

export interface EditMenuReportRequest {
  dishMenuId: number;
  quantityPrepared: number;
  cooks: number[];
}
