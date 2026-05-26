import { Component, OnInit, computed, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MenuReportApiService } from '@features/menu-report/services/menu-report-api.service';
import { MenuReportStateService } from '@features/menu-report/services/menu-report-state.service';
import { AuthStateService } from '@core/auth/services/auth-state.service';
import { ProductStateService } from '@features/products/services/product-state.service';
import { ProductApiService } from '@features/products/services/product-api.service';
import { ProductResponse } from '@features/products/interfaces/product.response';
import { ProductRecordResponse } from '@features/menu-report/interfaces/menu-report.response';
import { ToastService } from '@shared/services/toast.service';

declare const bootstrap: any;

@Component({
  selector: 'app-menu-report-products-fragment',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './menu-report-products-fragment.component.html',
})
export class MenuReportProductsFragmentComponent implements OnInit {
  private readonly menuReportService = inject(MenuReportApiService);
  private readonly menuReportState = inject(MenuReportStateService);
  private readonly productService = inject(ProductApiService);
  private readonly productState = inject(ProductStateService);
  private readonly toastService = inject(ToastService);
  readonly authState = inject(AuthStateService);

  readonly report = this.menuReportState.report;

  productSearch = signal('');
  productSource = signal<'COMPRA' | 'DONACION'>('COMPRA');
  amount = signal<number | null>(null);
  unitPrice = signal<number | null>(null);
  selectedProduct: ProductResponse | null = null;
  editingRecord: ProductRecordResponse | null = null;
  loading = false;

  readonly allProducts = this.productState.products;

  readonly filteredProducts = computed(() => {
    const term = this.productSearch().toLowerCase();
    if (!term) return [];
    return this.allProducts().filter(
      (p) => p.status === 'ACTIVO' && p.name.toLowerCase().includes(term)
    );
  });

  // detecta si el reporte tiene productos de donación (vino de plantilla)
  readonly hasTemplateProducts = computed(() =>
    (this.report()?.registro ?? []).some((r) => r.sourceProduct === 'DONACION')
  );

  ngOnInit(): void {
    if (this.productState.products().length === 0) {
      this.productService.listByStatus('ACTIVO').subscribe((products) => {
        this.productState.setProducts(products);
      });
    }
  }

  openAddModal(): void {
    this.resetForm();
    const modal = new bootstrap.Modal(document.getElementById('productRecordModal'));
    modal.show();
  }

  openEditModal(record: ProductRecordResponse): void {
    this.editingRecord = record;
    this.productSource.set(record.sourceProduct);
    this.amount.set(record.amount);
    this.unitPrice.set(null);
    const modal = new bootstrap.Modal(document.getElementById('productRecordModal'));
    modal.show();
  }

  selectProduct(product: ProductResponse): void {
    this.selectedProduct = product;
    this.productSearch.set('');
  }

  saveProduct(): void {
    const report = this.report();
    if (!report || this.loading) return;
    if (!this.editingRecord && !this.selectedProduct) return;
    if (!this.amount()) return;

    this.loading = true;

    const request = {
      productoId: this.editingRecord
        ? this.editingRecord.productoId
        : this.selectedProduct!.id,
      amount: this.amount()!,
      productSource: this.productSource(),
      unitPrice: this.productSource() === 'COMPRA' ? (this.unitPrice() ?? 0) : 0,
    };

    const call = this.editingRecord
      ? this.menuReportService.editProduct(report.id, this.editingRecord.productoId, request)
      : this.menuReportService.addProduct(report.id, request);

    call.subscribe({
      next: () => {
        this.toastService.show(
          this.editingRecord ? 'Producto actualizado' : 'Producto agregado',
          'success'
        );
        this.reloadReport();
        bootstrap.Modal.getInstance(document.getElementById('productRecordModal')!)?.hide();
        this.resetForm();
      },
      error: (error) => {
        this.toastService.show('Error: ' + error.error.message, 'danger');
        this.loading = false;
      },
      complete: () => {
        this.loading = false;
      },
    });
  }

  removeProduct(record: ProductRecordResponse): void {
    const report = this.report();
    if (!report) return;

    this.menuReportService.removeProduct(report.id, record.productoId).subscribe({
      next: () => {
        this.toastService.show('Producto eliminado', 'warning');
        this.reloadReport();
      },
      error: (error) => {
        this.toastService.show('Error: ' + error.error.message, 'danger');
      },
    });
  }

  reloadReport(): void {
    const date = this.report()!.date;
    this.menuReportService.getByDate(date).subscribe({
      next: (report) => this.menuReportState.setReport(report),
    });
  }

  resetForm(): void {
    this.selectedProduct = null;
    this.editingRecord = null;
    this.productSearch.set('');
    this.productSource.set('COMPRA');
    this.amount.set(null);
    this.unitPrice.set(null);
  }
}