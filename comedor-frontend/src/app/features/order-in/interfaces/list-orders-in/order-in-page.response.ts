import { OrderInListItem } from '../order-in/order-in-item';

export interface OrderInPageResponse {
  content: OrderInListItem[];
  totalPages: number;
  totalElements: number;
  number: number;
  size: number;
  first: boolean;
  last: boolean;
  numberOfElements: number;
  empty: boolean;
}
