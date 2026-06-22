import { CreatePurchaseDetailRequest } from './purchase-detail.request';

export interface CreatePurchaseRequest {
  date: string;
  details: CreatePurchaseDetailRequest[];
}
