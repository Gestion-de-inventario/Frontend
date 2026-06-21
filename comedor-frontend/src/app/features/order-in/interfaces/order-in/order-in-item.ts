import { OrderSource } from '../order.source';

export interface OrderInListItem {
  reference: string;
  id: number;
  source: OrderSource;
  date: string;
  status: string;
  totalSpent?: number;
  details?: OrderInDetail[];
}

export interface OrderInDetail {
  productId: number;
  productName: string;
  productUnit: string;
  quantity: number;
  unitPrice?: number;
  subTotal?: number;
}
