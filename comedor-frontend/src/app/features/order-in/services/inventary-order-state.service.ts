import { Injectable, signal } from '@angular/core';

import { MissingProductsResponse } from '../interfaces/missing-products.response';
import { PurchaseDetailForm } from '../interfaces/purchase-detail-form.request';
import { OrderSource } from '../interfaces/order.source';

@Injectable({
  providedIn: 'root',
})
export class InventoryOrderStateService {
  readonly missingProducts = signal<MissingProductsResponse[]>([]);

  readonly draftOrder = signal<PurchaseDetailForm[]>([]);

  readonly orderType = signal<OrderSource>('COMPRA');

  setOrderType(source: OrderSource): void {
    this.orderType.set(source);
  }

  setMissingProducts(products: MissingProductsResponse[]): void {
    this.missingProducts.set(products);
  }

  clearMissingProducts(): void {
    this.missingProducts.set([]);
  }

  setDraftOrder(details: PurchaseDetailForm[]): void {
    this.draftOrder.set(details);
  }

  clearDraftOrder(): void {
    this.draftOrder.set([]);
  }
}
