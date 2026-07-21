import { Component, inject, OnInit, signal, HostListener } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { MissingProductsResponse } from '@features/order-in/interfaces/missing-products.response';

import { ProductStateService } from '@features/products/services/product-state.service';
import { PurchaseDetailForm } from '@features/order-in/interfaces/purchase-detail-form.request';
import { ProductResponse } from '@features/products/interfaces/product.response';
import { PurchaseApiService } from '@features/order-in/services/purchase-api.service';
import { ProductApiService } from '@features/products/services/product-api.service';
import { ToastService } from '@shared/services/toast.service';
import { finalize } from 'rxjs/internal/operators/finalize';
import { CreatePurchaseRequest } from '@features/order-in/interfaces/purchase/purchase.request';
import { InventoryOrderStateService } from '@features/order-in/services/inventary-order-state.service';
import { AuthStateService } from '@core/auth/services/auth-state.service';
import { SearchSelectComponent } from '@shared/components/search-select/search-select';
import { OrderSource } from '@features/order-in/interfaces/order.source';
import { DonationApiService } from '@features/order-in/services/donation-api.service';
import { CreateDonationRequest } from '@features/order-in/interfaces/donation/donation.request';

@Component({
  selector: 'app-purchase-order-create-fragment',
  standalone: true,
  imports: [CommonModule, FormsModule, SearchSelectComponent],
  templateUrl: './create-orden-in-fragment.component.html',
})
export class InventoryOrderCreateFragmentComponent implements OnInit {
  private readonly router = inject(Router);
  private readonly donationService = inject(DonationApiService);
  private readonly purchaseService = inject(PurchaseApiService);
  private readonly productService = inject(ProductApiService);
  private readonly toastService = inject(ToastService);
  private readonly inventoryOrderState = inject(InventoryOrderStateService);

  readonly orderType = this.inventoryOrderState.orderType;

  loading = signal(false);
  initialLoading = signal(false);

  productState = inject(ProductStateService);
  missingProducts = signal<MissingProductsResponse[]>([]);
  products = this.productState.products;

  productLabel = (product: ProductResponse) => `${product.name} (${product.unit})`;

  purchaseDetails = signal<PurchaseDetailForm[]>([]);

  quantityTouched = signal(false);

  readonly authState = inject(AuthStateService);

  canCreate = this.authState.hasPermission('CREATE_ORDER_IN');

  orderCreated = signal(false);

  createdOrderType = signal<OrderSource | null>(null);

  createdOrderId = signal<number | null>(null);

  openDropdown = signal<number | null>(null);

  date = signal<string>(this.getPeruToday());

  minDate = signal<string>(this.getPeruToday());

  maxDate = signal<string>(this.getPeruEndOfYear());

  submitted = signal(false);

  touchedFields = signal<Set<string>>(new Set());

  @HostListener('document:click')
  closeDropdown(): void {
    this.openDropdown.set(null);
  }

  ngOnInit(): void {
    const missingProducts = this.inventoryOrderState.missingProducts();

    if (missingProducts.length > 0) {
      this.missingProducts.set(missingProducts);

      this.buildDraft();
      return;
    }

    const draftPurchase = this.inventoryOrderState.draftOrder();

    if (draftPurchase.length > 0) {
      this.purchaseDetails.set(
        draftPurchase.map((detail) => ({
          ...detail,
        })),
      );

      this.inventoryOrderState.clearDraftOrder();

      return;
    }
  }

  constructor() {
    this.initialLoading.set(true);
    this.productService.listByStatus('ACTIVO').subscribe({
      next: (products) => {
        this.productState.setProducts(products);
        this.initialLoading.set(false);
      },
      error: () => {
        this.initialLoading.set(false);
        this.toastService.show('Error al cargar información inicial', 'danger');
      },
    });
  }

  buildDraft(): void {
    this.purchaseDetails.set(
      this.inventoryOrderState.missingProducts().map((product) => ({
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
    const parsedQuantity = Number(quantity);

    this.purchaseDetails.update((details) =>
      details.map((d, i) =>
        i === index
          ? {
              ...d,
              quantity: parsedQuantity,
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
    const parsedPrice = Number(unitPrice);
    this.purchaseDetails.update((details) =>
      details.map((d, i) =>
        i === index
          ? {
              ...d,
              unitPrice: parsedPrice,
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

  createOrder(): void {
    this.submitted.set(true);

    if (this.loading()) return;

    if (this.isFormInvalid()) {
      this.toastService.show(
        'Completa correctamente la fecha, productos, cantidades y precios antes de guardar.',
        'warning',
      );
      return;
    }

    if (this.orderType() === 'COMPRA') {
      this.createPurchase();
      return;
    }

    this.createDonation();
  }

  createPurchase(): void {
    if (this.loading()) return;

    const request: CreatePurchaseRequest = {
      date: this.date(),
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

          this.createdOrderId.set(purchase.id);

          this.createdOrderType.set('COMPRA');

          this.orderCreated.set(true);
        },
        error: (error) => {
          console.error(error);
          this.toastService.show('No se pudo registrar el ingreso de insumos');
        },
      });
  }

  private createDonation(): void {
    const request: CreateDonationRequest = {
      date: this.date(),
      details: this.purchaseDetails().map((d) => ({
        productId: d.productId!,
        quantity: d.quantity,
      })),
    };

    this.loading.set(true);

    this.donationService
      .create(request)
      .pipe(
        finalize(() => {
          this.loading.set(false);
        }),
      )
      .subscribe({
        next: (donation) => {
          this.toastService.show('Donacion creada exitosamente');
          this.createdOrderId.set(donation.id);
          this.createdOrderType.set('DONACION');
          this.orderCreated.set(true);
        },
        error: (error) => {
          console.error(error);
          this.toastService.show('Error al crear la orden');
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
    this.orderCreated.set(false);

    this.createdOrderId.set(null);
    this.createdOrderType.set(null);

    this.missingProducts.set([]);

    this.date.set(this.getPeruToday());

    this.submitted.set(false);
    this.touchedFields.set(new Set());

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
  changeOrderType(source: OrderSource): void {
    this.inventoryOrderState.setOrderType(source);

    if (source === 'DONACION') {
      this.purchaseDetails.update((details) =>
        details.map((detail) => ({
          ...detail,
          unitPrice: 0,
        })),
      );
    }
  }

  private getPeruToday(): string {
    return new Intl.DateTimeFormat('en-CA', {
      timeZone: 'America/Lima',
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
    }).format(new Date());
  }

  private getPeruEndOfYear(): string {
    const year = new Intl.DateTimeFormat('en', {
      timeZone: 'America/Lima',
      year: 'numeric',
    }).format(new Date());

    return `${year}-12-31`;
  }

  isFormInvalid(): boolean {
    if (!this.date()) {
      return true;
    }

    if (this.date() < this.minDate()) {
      return true;
    }

    if (this.date() > this.maxDate()) {
      return true;
    }

    if (this.purchaseDetails().length === 0) {
      return true;
    }

    if (this.hasDuplicateProducts()) {
      return true;
    }

    return this.purchaseDetails().some((detail) => {
      if (!detail.productId) return true;

      if (this.isQuantityInvalid(detail)) return true;

      if (this.orderType() === 'COMPRA' && this.isPriceInvalid(detail)) return true;

      return false;
    });
  }

  private fieldKey(index: number, field: 'product' | 'quantity' | 'unitPrice'): string {
    return `${index}-${field}`;
  }

  markTouched(index: number, field: 'product' | 'quantity' | 'unitPrice'): void {
    this.touchedFields.update((fields) => {
      const copy = new Set(fields);
      copy.add(this.fieldKey(index, field));
      return copy;
    });
  }

  shouldShowError(index: number, field: 'product' | 'quantity' | 'unitPrice'): boolean {
    return this.submitted() || this.touchedFields().has(this.fieldKey(index, field));
  }

  isRequiredValue(value: number | null | undefined): boolean {
    return value === null || value === undefined || value === 0 || Number.isNaN(Number(value));
  }

  isPositiveNumber(value: number | null | undefined): boolean {
    return Number(value) > 0;
  }

  isDecimalOrInteger(value: number | null | undefined): boolean {
    if (value === null || value === undefined) return false;

    const valueAsString = String(value);

    return /^\d+(\.\d+)?$/.test(valueAsString);
  }

  isQuantityInvalid(detail: PurchaseDetailForm): boolean {
    return this.isRequiredValue(detail.quantity) || !this.isPositiveNumber(detail.quantity);
  }

  isPriceInvalid(detail: PurchaseDetailForm): boolean {
    return (
      this.orderType() === 'COMPRA' &&
      (this.isRequiredValue(detail.unitPrice) ||
        !this.isDecimalOrInteger(detail.unitPrice) ||
        !this.isPositiveNumber(detail.unitPrice) ||
        !this.hasValidPriceFormat(detail.unitPrice))
    );
  }

  limitQuantityDigits(event: Event, index: number): void {
    this.markTouched(index, 'quantity');

    const input = event.target as HTMLInputElement;

    let value = input.value;

    value = value.replace(',', '.');

    value = value.replace(/[^0-9.]/g, '');

    const parts = value.split('.');

    const integerPart = parts[0].slice(0, 5);

    const decimalPart = parts[1]?.slice(0, 2);

    if (parts.length > 1) {
      value = `${integerPart}.${decimalPart ?? ''}`;
    } else {
      value = integerPart;
    }

    input.value = value;

    this.purchaseDetails.update((details) =>
      details.map((detail, i) =>
        i === index
          ? {
              ...detail,
              quantity: value ? Number(value) : 0,
            }
          : detail,
      ),
    );
  }

  limitPriceDigits(event: Event, index: number): void {
    this.markTouched(index, 'unitPrice');

    const input = event.target as HTMLInputElement;

    let value = input.value;

    value = value.replace(',', '.');

    value = value.replace(/[^0-9.]/g, '');

    const parts = value.split('.');

    const integerPart = parts[0].slice(0, 5);

    let decimalPart = parts[1]?.slice(0, 2);

    if (parts.length > 2) {
      value = `${integerPart}.${decimalPart ?? ''}`;
    } else if (parts.length === 2) {
      value = `${integerPart}.${decimalPart ?? ''}`;
    } else {
      value = integerPart;
    }

    input.value = value;

    this.purchaseDetails.update((details) =>
      details.map((detail, i) =>
        i === index
          ? {
              ...detail,
              unitPrice: value ? Number(value) : 0,
            }
          : detail,
      ),
    );
  }

  isInteger(value: number | null | undefined): boolean {
    if (value === null || value === undefined) return false;

    return Number.isInteger(Number(value));
  }

  hasValidPriceFormat(value: number | null | undefined): boolean {
    if (value === null || value === undefined) return false;

    return /^\d{1,5}(\.\d{1,2})?$/.test(String(value));
  }

  hasValidQuantityFormat(value: number): boolean {
    return /^\d{1,5}(\.\d{1,2})?$/.test(value.toString());
  }
}
