import { Component, computed, inject } from '@angular/core';
import { FormControl, FormGroup, ReactiveFormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { AuthStateService } from '@core/auth/services/auth-state.service';
import { ToastService } from '@shared/services/toast.service';
import { ProductApiService } from '@features/products/services/product-api.service';
import { ProductStateService } from '@features/products/services/product-state.service';
import { CategoryApiService } from '@features/categoriesandtags/services/category-api.service';
import { TagApiService } from '@features/categoriesandtags/services/tag-api.service';
import { CategoryResponse } from '@features/categoriesandtags/interfaces/category.response';
import { TagResponse } from '@features/categoriesandtags/interfaces/tag.response';

@Component({
  selector: 'app-product-detail-modal',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './product-detail-modal.component.html',
})
export class ProductDetailModalComponent {
  readonly authState = inject(AuthStateService);
  private readonly productState = inject(ProductStateService);
  private readonly productService = inject(ProductApiService);
  private readonly categoryService = inject(CategoryApiService);
  private readonly tagService = inject(TagApiService);
  private readonly toastService = inject(ToastService);

  readonly product = computed(() => this.productState.selectedProduct());

  mode: 'view' | 'edit' = 'view';
  loading = false;
  tieneTransacciones = false;

  categories: CategoryResponse[] = [];
  tags: TagResponse[] = [];

  readonly form = new FormGroup({
    name: new FormControl<string | null>(null),
    categoryId: new FormControl<number | null>(null),
    tagId: new FormControl<number | null>(null),
    unit: new FormControl<string | null>(null),
    reorderPoint: new FormControl<number | null>(null),
  });

  constructor() {
    this.categoryService.listByStatus('ACTIVO').subscribe({
      next: (categories) => (this.categories = categories),
    });
    this.tagService.listByStatus('ACTIVO').subscribe({
      next: (tags) => (this.tags = tags),
    });
  }

  openEdit(): void {
    const product = this.product();
    if (!product) return;

    this.form.patchValue({
      name: product.name,
      categoryId: product.categoryId,
      tagId: product.tagId,
      unit: product.unit,
      reorderPoint: product.reorderPoint,
    });

    this.mode = 'edit';
  }

  goBack(): void {
    this.mode = 'view';
  }

  save(): void {
    const product = this.product();
    if (!product || this.loading) return;

    this.loading = true;

    this.productService.edit(product.id, {
      name: this.form.value.name ?? undefined,
      categoryId: this.form.value.categoryId ?? undefined,
      tagId: this.form.value.tagId ?? undefined,
      unit: this.form.value.unit ?? undefined,
      reorderPoint: this.form.value.reorderPoint ?? undefined,
    }).subscribe({
      next: (updated) => {
        this.productState.updateProduct(updated);
        this.toastService.show('Producto actualizado', 'success');
        this.mode = 'view';
      },
      error: (error) => {
        this.toastService.show('No se pudo actualizar: ' + error.error.message, 'danger');
      },
      complete: () => {
        this.loading = false;
      },
    });
  }

  changeStatus(status: string): void {
    const product = this.product();
    if (!product || this.loading) return;

    this.loading = true;

    this.productService.changeStatus(product.id, status).subscribe({
      next: (updated) => {
        this.productState.updateProduct(updated);
        this.toastService.show(
          status === 'ACTIVO' ? 'Producto activado' : 'Producto desactivado',
          status === 'ACTIVO' ? 'success' : 'warning'
        );
      },
      error: (error) => {
        this.toastService.show('No se pudo cambiar el estado: ' + error.error.message, 'danger');
      },
      complete: () => {
        this.loading = false;
      },
    });
  }

  close(): void {
    this.mode = 'view';
    this.productState.clearSelectedProduct();
  }
}