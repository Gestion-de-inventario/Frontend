export interface MenuReportRequest {
  dishMenuId: number;
  quantityPrepared: number;
  cooks: number[];
  createDate: string;
}

export interface EditMenuReportRequest {
  dishMenuId: number;
  quantityPrepared: number;
  cooks: number[];
}
