import { Injectable, inject, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { MissingProductsResponse } from '../interfaces/missing-products.response';

@Injectable({
  providedIn: 'root',
})
export class PurchaseOrderStateService {
  readonly missingProducts = signal<MissingProductsResponse[]>([]);

  setMissingProducts(products: MissingProductsResponse[]): void {
    this.missingProducts.set(products);
  }

  clearMissingProducts(): void {
    this.missingProducts.set([]);
  }
}
