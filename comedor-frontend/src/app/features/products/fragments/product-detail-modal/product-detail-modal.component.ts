import { Component, computed, inject, signal } from '@angular/core';
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
  loading = signal<boolean>(false);
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

    this.form.reset();

    this.form.patchValue({
      name: product.name,
      categoryId: Number(product.categoryId),
      tagId: product.tagId ?? 0,
      unit: this.normalizeUnit(product.unit),
      reorderPoint: Number(product.reorderPoint),
    });

    console.log('Producto:', product);
    console.log('Formulario parcheado:', this.form.getRawValue());

    this.mode = 'edit';
  }

  goBack(): void {
    this.mode = 'view';
  }

  save(): void {
    const product = this.product();
    if (!product || this.loading()) return;

    this.loading.set(true);

    const raw = this.form.getRawValue();

    this.productService
      .edit(product.id, {
        name: raw.name ?? undefined,
        categoryId: raw.categoryId ?? undefined,
        tagId: raw.tagId ?? 0,
        unit: raw.unit ?? undefined,
        reorderPoint: raw.reorderPoint ?? undefined,
      })
      .subscribe({
        next: (updated) => {
          this.productState.updateProduct(updated);
          this.toastService.show('Producto actualizado', 'success');
          this.mode = 'view';
        },
        error: (error) => {
          this.toastService.show('No se pudo actualizar: ' + error.error.message, 'danger');
          this.loading.set(false);
        },
        complete: () => {
          this.loading.set(false);
        },
      });
  }

  changeStatus(status: string): void {
    const product = this.product();
    if (!product || this.loading()) return;

    this.loading.set(true);

    this.productService.changeStatus(product.id, status).subscribe({
      next: (updated) => {
        this.productState.updateProduct(updated);
        this.toastService.show(
          status === 'ACTIVO' ? 'Producto activado' : 'Producto desactivado',
          status === 'ACTIVO' ? 'success' : 'warning',
        );
      },
      error: (error) => {
        this.toastService.show('No se pudo cambiar el estado: ' + error.error.message, 'danger');
        this.loading.set(false);
      },
      complete: () => {
        this.loading.set(false);
      },
    });
  }

  close(): void {
    this.mode = 'view';
    this.productState.clearSelectedProduct();
  }

  private normalizeUnit(unit: string | null | undefined): string | null {
    if (!unit) return null;

    const unitMap: Record<string, string> = {
      KG: 'KILOGRAMOS',
      KILOGRAMOS: 'KILOGRAMOS',

      L: 'LITROS',
      LITROS: 'LITROS',

      UNIDAD: 'UNIDADES',
      UNIDADES: 'UNIDADES',
    };

    return unitMap[unit] ?? unit;
  }
}
