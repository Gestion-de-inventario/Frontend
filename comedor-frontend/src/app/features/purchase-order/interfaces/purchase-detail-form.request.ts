export interface PurchaseDetailForm {
  productId: number | null;
  productName: string;

  quantity: number;
  unitPrice: number;

  search: string;
}
