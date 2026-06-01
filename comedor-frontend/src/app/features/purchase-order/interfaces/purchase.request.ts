import { CreatePurchaseDetailRequest } from './purchase-detail.request';

export interface CreatePurchaseRequest {
  details: CreatePurchaseDetailRequest[];
}
