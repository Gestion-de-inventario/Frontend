import { MissingProductsResponse } from './missing-products.response';

export interface StockInsufficientResponse {
  faltantes: MissingProductsResponse[];
}
