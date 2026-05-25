import { Injectable, signal } from '@angular/core';
import { ProductResponse } from '../interfaces/product.response';

@Injectable({
  providedIn: 'root',
})
export class ProductStateService {
  private readonly _products = signal<ProductResponse[]>([]);
  readonly products = this._products.asReadonly();

  private readonly _selectedProduct = signal<ProductResponse | null>(null);
  readonly selectedProduct = this._selectedProduct.asReadonly();

  setProducts(products: ProductResponse[]): void {
    this._products.set(products);
  }

  selectProduct(product: ProductResponse): void {
    this._selectedProduct.set(product);
  }

  clearSelectedProduct(): void {
    this._selectedProduct.set(null);
  }

  addProduct(product: ProductResponse): void {
    this._products.update((products) => [product, ...products]);
  }

  updateProduct(updated: ProductResponse): void {
    this._products.update((products) =>
      products.map((p) => (p.id === updated.id ? updated : p))
    );
    const selected = this._selectedProduct();
    if (selected && selected.id === updated.id) {
      this._selectedProduct.set(updated);
    }
  }
}