import { TransactionsResponse } from './transactions.response';

export interface TransactionPageResponse {
  content: TransactionsResponse[];

  totalPages: number;
  totalElements: number;

  number: number;
  size: number;

  first: boolean;
  last: boolean;

  numberOfElements: number;

  empty: boolean;
}
