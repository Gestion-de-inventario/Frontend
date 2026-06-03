import { Component, computed, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ProductApiService } from '@features/products/services/product-api.service';
import { ProductStateService } from '@features/products/services/product-state.service';
import { AuthStateService } from '@core/auth/services/auth-state.service';
import { ProductDetailModalComponent } from '../product-detail-modal/product-detail-modal.component';

declare const bootstrap: any;

@Component({
  selector: 'app-product-list-fragment',
  standalone: true,
  imports: [CommonModule, FormsModule, ProductDetailModalComponent],
  templateUrl: './product-list-fragment.component.html',
})
export class ProductListFragmentComponent {
  private readonly productService = inject(ProductApiService);
  private readonly productState = inject(ProductStateService);
  readonly authState = inject(AuthStateService);

  search = signal('');
  onlyActive = signal(false);
  currentPage = signal(1);
  readonly pageSize = 10;

  loading = signal<boolean>(true);

  readonly products = this.productState.products;

  readonly filteredProducts = computed(() => {
    let products = this.products();

    if (this.onlyActive()) {
      products = products.filter((p) => p.status === 'ACTIVO');
    }

    products = products.filter((p) => {
      const term = this.search().toLowerCase();
      return (
        p.name.toLowerCase().includes(term) ||
        p.categoryName.toLowerCase().includes(term) ||
        (p.tagName?.toLowerCase().includes(term) ?? false)
      );
    });

    products = [...products].sort((a, b) => a.name.localeCompare(b.name));

    return products;
  });

  readonly totalPages = computed(() =>
    Math.ceil(this.filteredProducts().length / this.pageSize)
  );

  readonly pagedProducts = computed(() => {
    const start = (this.currentPage() - 1) * this.pageSize;
    return this.filteredProducts().slice(start, start + this.pageSize);
  });

  readonly pages = computed(() =>
    Array.from({ length: this.totalPages() }, (_, i) => i + 1)
  );

  constructor() {
    this.loadProducts();
  }

  loadProducts(): void {
    this.loading.set(true);

    this.productService.listByStatus().subscribe({
      next: (products) => {
        this.productState.setProducts(products);
        this.currentPage.set(1);
        this.loading.set(false);
      },
      error: (err) => {
        console.error('Error cargando productos', err);
        this.loading.set(false);
      }
    });
  }

  goToPage(page: number): void {
    if (page >= 1 && page <= this.totalPages()) {
      this.currentPage.set(page);
    }
  }

  openProduct(product: any): void {
    this.productState.selectProduct(product);
    const modal = new bootstrap.Modal(document.getElementById('productDetailModal'));
    modal.show();
  }
}