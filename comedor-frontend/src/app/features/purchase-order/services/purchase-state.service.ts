import { Injectable, inject, signal } from '@angular/core';
import { MissingProductsResponse } from '../interfaces/missing-products.response';
import { PurchaseDetailForm } from '../interfaces/purchase-detail-form.request';

@Injectable({
  providedIn: 'root',
})
export class PurchaseOrderStateService {
  readonly missingProducts = signal<MissingProductsResponse[]>([]);
  readonly draftPurchase = signal<PurchaseDetailForm[]>([]);

  setMissingProducts(products: MissingProductsResponse[]): void {
    this.missingProducts.set(products);
  }

  clearMissingProducts(): void {
    this.missingProducts.set([]);
  }

  setDraftPurchase(details: PurchaseDetailForm[]): void {
    this.draftPurchase.set(details);
  }

  clearDraftPurchase(): void {
    this.draftPurchase.set([]);
  }
}
