import { Component, computed, inject, signal } from '@angular/core';
import { FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
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
  styleUrl: './product-detail-modal.component.scss',
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
    name: new FormControl<string | null>('', {
      nonNullable: true,
      validators: [
        Validators.required,
        Validators.minLength(2),
        Validators.maxLength(50),
        Validators.pattern(/^[A-Za-zÁÉÍÓÚáéíóúÑñ\s]+$/),
      ],
    }),
    categoryId: new FormControl<number | null>(null),
    tagId: new FormControl<number | null>(null),
    unit: new FormControl<string | null>(null),
    reorderPoint: new FormControl<string>('', {
      nonNullable: true,
      validators: [Validators.required, Validators.pattern(/^\d{1,5}([.,]\d{1,2})?$/)],
    }),
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

    this.form.reset({
      name: '',
      categoryId: null,
      tagId: 0,
      unit: null,
      reorderPoint: '',
    });
    this.form.controls.reorderPoint.setValue(product.reorderPoint.toString().replace('.', ','));
    this.form.patchValue({
      name: product.name,
      categoryId: Number(product.categoryId),
      tagId: product.tagId ?? 0,
      unit: this.normalizeUnit(product.unit),
      reorderPoint: product.reorderPoint.toString().replace('.', ','),
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
    const reorderPoint = Number(raw.reorderPoint.replace(',', '.'));
    this.productService
      .edit(product.id, {
        name: raw.name ?? undefined,
        categoryId: raw.categoryId ?? undefined,
        tagId: raw.tagId ?? 0,
        unit: raw.unit ?? undefined,
        reorderPoint: reorderPoint ?? undefined,
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
      KG: 'KG',
      KILOGRAMOS: 'KG',

      L: 'L',
      LITROS: 'L',

      UNIDAD: 'UNIDADES',
      UNIDADES: 'UNIDADES',
    };

    return unitMap[unit] ?? unit;
  }

  onNameInput(event: Event, controlName: 'name'): void {
    const input = event.target as HTMLInputElement;
    const cleaned = input.value.replace(/[^A-Za-zÁÉÍÓÚáéíóúÑñ\s]/g, '');
    if (cleaned !== input.value) {
      this.form.controls[controlName].setValue(cleaned, { emitEvent: false });
    }
  }

  limitReorderPointDigits(event: Event): void {
    const input = event.target as HTMLInputElement;

    let value = input.value;

    // Solo números, punto y coma
    value = value.replace(/[^0-9.,]/g, '');

    // Normaliza coma a punto visualmente
    value = value.replace(',', '.');

    // Permite solo un punto
    const parts = value.split('.');

    const integerPart = parts[0].slice(0, 5);
    const decimalPart = parts[1]?.slice(0, 2);

    if (parts.length > 1) {
      value = `${integerPart}.${decimalPart ?? ''}`;
    } else {
      value = integerPart;
    }

    input.value = value;

    this.form.controls.reorderPoint.setValue(value, {
      emitEvent: false,
    });
  }
}
