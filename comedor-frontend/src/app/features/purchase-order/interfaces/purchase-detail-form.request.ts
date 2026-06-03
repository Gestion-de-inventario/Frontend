export interface PurchaseDetailForm {
  productId: number | null;
  productName: string;
  productUnit: string;
  quantity: number;
  unitPrice: number;

  search: string;
}
