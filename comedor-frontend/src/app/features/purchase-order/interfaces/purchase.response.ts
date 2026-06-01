import { PurchaseDetailResponse } from './purchase-detail.response';

export interface PurchaseResponse {
  id: number;
  purchaseDate: string;
  status: string;
  totalSpent: number;
  details: PurchaseDetailResponse[];
}
