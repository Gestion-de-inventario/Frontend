import { MenuReportResponse } from '@features/menu-report/interfaces/menu-report.response';

export interface MenuPageResponse {
  content: MenuReportResponse[];

  totalPages: number;
  totalElements: number;

  number: number;
  size: number;

  first: boolean;
  last: boolean;

  numberOfElements: number;

  empty: boolean;
}
