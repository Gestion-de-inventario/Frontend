import { PurchaseResponse } from '../purchase.response';

export interface PurchasePageResponse {
  content: PurchaseResponse[];

  totalPages: number;
  totalElements: number;

  number: number;
  size: number;

  first: boolean;
  last: boolean;

  numberOfElements: number;

  empty: boolean;
}
