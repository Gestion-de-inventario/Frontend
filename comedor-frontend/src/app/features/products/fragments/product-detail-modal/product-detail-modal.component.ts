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

    const rawCategoryId = this.form.value.categoryId;
    const rawTagId = this.form.value.tagId;
    const rawReorder = this.form.value.reorderPoint;

    const requestPayload = {
      name: this.form.value.name ?? undefined,
      unit: this.form.value.unit ?? undefined,
      reorderPoint: rawReorder ? Number(rawReorder) : undefined,
      category: rawCategoryId ? { id: Number(rawCategoryId) } : undefined,
      tag: rawTagId ? { id: Number(rawTagId) } : undefined,
    };

    this.productService.edit(product.id, requestPayload).subscribe({
      next: (updated) => {
      
        const chosenCategory = this.categories.find(c => c.id === Number(rawCategoryId));
        const chosenTag = this.tags.find(t => t.id === Number(rawTagId));

       
        const productWithNames = {
          ...updated,
          categoryName: chosenCategory ? chosenCategory.name : 'Sin categoría',
          tagName: chosenTag ? chosenTag.name : null,
          categoryId: rawCategoryId ? Number(rawCategoryId) : updated.categoryId,
          tagId: rawTagId ? Number(rawTagId) : updated.tagId
        };

  
        this.productState.updateProduct(productWithNames);
        
        this.toastService.show('Producto actualizado correctamente', 'success');
        this.mode = 'view';
        this.loading = false; 
      },
      error: (err) => {
        const errorMessage = err.error?.message || 'Error desconocido al actualizar';
        this.toastService.show(errorMessage, 'danger');
        this.loading = false;
      }
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
        this.loading = false;
      },
      error: (err) => {
        const errorMessage = err.error?.message || 'Error desconocido al cambiar estado';
        this.toastService.show(errorMessage, 'danger');
        this.loading = false;
      }
    });
  }

  close(): void {
    this.mode = 'view';
    this.productState.clearSelectedProduct();
  }
}