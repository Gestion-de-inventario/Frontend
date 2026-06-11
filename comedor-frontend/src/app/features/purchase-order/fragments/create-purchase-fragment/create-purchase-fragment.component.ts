import { Component, inject, OnInit, signal, HostListener } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { MissingProductsResponse } from '@features/purchase-order/interfaces/missing-products.response';

import { ProductStateService } from '@features/products/services/product-state.service';
import { PurchaseDetailForm } from '@features/purchase-order/interfaces/purchase-detail-form.request';
import { ProductResponse } from '@features/products/interfaces/product.response';
import { PurchaseApiService } from '@features/purchase-order/services/purchase-api.service';
import { ProductApiService } from '@features/products/services/product-api.service';
import { ToastService } from '@shared/services/toast.service';
import { finalize } from 'rxjs/internal/operators/finalize';
import { CreatePurchaseRequest } from '@features/purchase-order/interfaces/purchase.request';
import { PurchaseOrderStateService } from '@features/purchase-order/services/purchase-state.service';
import { AuthStateService } from '@core/auth/services/auth-state.service';

@Component({
  selector: 'app-purchase-order-create-fragment',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './create-purchase-fragment.component.html',
})
export class PurchaseOrderCreateFragmentComponent implements OnInit {
  private readonly router = inject(Router);
  private readonly purchaseService = inject(PurchaseApiService);
  private readonly productService = inject(ProductApiService);
  private readonly toastService = inject(ToastService);
  private readonly purchaseOrderState = inject(PurchaseOrderStateService);

  loading = signal(false);

  productState = inject(ProductStateService);
  missingProducts = signal<MissingProductsResponse[]>([]);
  products = this.productState.products;

  purchaseDetails = signal<PurchaseDetailForm[]>([]);

  readonly authState = inject(AuthStateService);

  canCreate = this.authState.hasPermission('PURCHASE_CREATE');

  purchaseCreated = signal(false);

  createdPurchaseId = signal<number | null>(null);

  openDropdown = signal<number | null>(null);

  @HostListener('document:click')
  closeDropdown(): void {
    this.openDropdown.set(null);
  }

  ngOnInit(): void {
    const missingProducts = this.purchaseOrderState.missingProducts();

    if (missingProducts.length > 0) {
      this.missingProducts.set(missingProducts);

      this.buildDraft();
      return;
    }

    const draftPurchase = this.purchaseOrderState.draftPurchase();

    if (draftPurchase.length > 0) {
      this.purchaseDetails.set(
        draftPurchase.map((detail) => ({
          ...detail,
        })),
      );

      this.purchaseOrderState.clearDraftPurchase();

      return;
    }
  }

  constructor() {
    this.productService.listByStatus().subscribe((products) => {
      this.productState.setProducts(products);
    });
  }

  buildDraft(): void {
    this.purchaseDetails.set(
      this.purchaseOrderState.missingProducts().map((product) => ({
        productId: product.productId,
        productName: product.productName,
        quantity: product.quantityNeeded,
        productUnit: product.productUnit,
        unitPrice: 0,
        search: '',
      })),
    );
  }

  removeDetail(index: number): void {
    this.purchaseDetails.update((details) => details.filter((_, i) => i !== index));
  }

  updateQuantity(index: number, quantity: number): void {
    this.purchaseDetails.update((details) =>
      details.map((d, i) =>
        i === index
          ? {
              ...d,
              quantity,
            }
          : d,
      ),
    );
  }
  updateSearch(index: number, search: string): void {
    this.purchaseDetails.update((details) =>
      details.map((d, i) =>
        i === index
          ? {
              ...d,
              search,
            }
          : d,
      ),
    );
  }

  updatePrice(index: number, unitPrice: number): void {
    this.purchaseDetails.update((details) =>
      details.map((d, i) =>
        i === index
          ? {
              ...d,
              unitPrice,
            }
          : d,
      ),
    );
  }

  addEmptyRow(): void {
    this.purchaseDetails.update((details) => [
      ...details,
      {
        productId: null,
        productName: '',
        productUnit: '',
        quantity: 1,
        unitPrice: 0,
        search: '',
      },
    ]);
  }

  createPurchase(): void {
    if (this.loading()) return;

    const request: CreatePurchaseRequest = {
      details: this.purchaseDetails()
        .filter((d) => d.productId)
        .map((d) => ({
          productId: d.productId!,
          quantity: d.quantity,
          unitPrice: d.unitPrice,
        })),
    };

    this.loading.set(true);

    this.purchaseService
      .create(request)
      .pipe(
        finalize(() => {
          this.loading.set(false);
        }),
      )
      .subscribe({
        next: (purchase) => {
          this.toastService.show('Compra creada exitosamente');
          this.createdPurchaseId.set(purchase.id);

          this.purchaseCreated.set(true);
        },
        error: (error) => {
          console.error(error);
          this.toastService.show('Error al crear la compra');
        },
      });
  }

  hasDuplicateProducts(): boolean {
    const ids = this.purchaseDetails()
      .map((d) => d.productId)
      .filter(Boolean);

    return ids.length !== new Set(ids).size;
  }

  selectProduct(index: number, product: ProductResponse): void {
    this.purchaseDetails.update((details) =>
      details.map((d, i) =>
        i === index
          ? {
              ...d,
              productId: product.id,
              productName: product.name,
              productUnit: product.unit,
              search: '',
            }
          : d,
      ),
    );
    this.openDropdown.set(null);
  }

  clearProduct(index: number): void {
    this.purchaseDetails.update((details) =>
      details.map((d, i) =>
        i === index
          ? {
              ...d,
              productId: null,
              productName: '',
              productUnit: '',
              search: '',
              unitPrice: 0,
            }
          : d,
      ),
    );

    setTimeout(() => {
      this.openDropdown.set(index);
    });
  }

  filteredProducts(search: string) {
    const products = this.products();

    if (!search?.trim()) {
      return products.slice(0, 5);
    }

    return products.filter((p) => p.name.toLowerCase().includes(search.toLowerCase())).slice(0, 5);
  }

  goToMenuReport(): void {
    this.router.navigate(['/menu-report']);
  }

  goBackToList(): void {
    this.router.navigate(['/purchase-order']);
  }
  createAnotherPurchase(): void {
    this.purchaseCreated.set(false);

    this.createdPurchaseId.set(null);

    this.missingProducts.set([]);

    this.purchaseDetails.set([
      {
        productId: null,
        productName: '',
        productUnit: '',
        quantity: 1,
        unitPrice: 0,
        search: '',
      },
    ]);
  }
}
