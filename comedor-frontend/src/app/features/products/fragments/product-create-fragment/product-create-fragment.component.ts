import { Component, inject } from '@angular/core';
import { FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { ProductApiService } from '@features/products/services/product-api.service';
import { ProductStateService } from '@features/products/services/product-state.service';
import { CategoryApiService } from '@features/categoriesandtags/services/category-api.service';
import { TagApiService } from '@features/categoriesandtags/services/tag-api.service';
import { ToastService } from '@shared/services/toast.service';
import { CategoryResponse } from '@features/categoriesandtags/interfaces/category.response';
import { TagResponse } from '@features/categoriesandtags/interfaces/tag.response';

declare const bootstrap: any;

@Component({
  selector: 'app-product-create-fragment',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './product-create-fragment.component.html',
  styleUrl:'./product-create-fragment.component.scss'
})
export class ProductCreateFragmentComponent {
  private readonly productService = inject(ProductApiService);
  private readonly productState = inject(ProductStateService);
  private readonly categoryService = inject(CategoryApiService);
  private readonly tagService = inject(TagApiService);
  private readonly toastService = inject(ToastService);

  categories: CategoryResponse[] = [];
  tags: TagResponse[] = [];
  loading = false;

  readonly form = new FormGroup({
    name: new FormControl('', {
      nonNullable: true,
      validators: [Validators.required],
    }),
    categoryId: new FormControl<number | null>(null, {
      validators: [Validators.required],
    }),
    tagId: new FormControl<number | null>(null),
    unit: new FormControl<string | null>(null, {
      validators: [Validators.required],
    }),
    stock: new FormControl<number | null>(null, {
      validators: [Validators.required],
    }),
    reorderPoint: new FormControl<number | null>(null, {
      validators: [Validators.required],
    }),
  });

  constructor() {
    this.loadCategories();
    this.loadTags();
  }

  loadCategories(): void {
    this.categoryService.listByStatus('ACTIVO').subscribe({
      next: (categories) => (this.categories = categories),
    });
  }

  loadTags(): void {
    this.tagService.listByStatus('ACTIVO').subscribe({
      next: (tags) => (this.tags = tags),
    });
  }

  openModal(): void {
    const modal = new bootstrap.Modal(document.getElementById('createProductModal'));
    modal.show();
  }

  create(): void {
    if (this.form.invalid || this.loading) return;

    this.loading = true;

    this.productService.create({
      name: this.form.getRawValue().name,
      categoryId: this.form.getRawValue().categoryId!,
      tagId: this.form.getRawValue().tagId ?? null,
      unit: this.form.getRawValue().unit!,
      stock: this.form.getRawValue().stock!,
      reorderPoint: this.form.getRawValue().reorderPoint!,
    }).subscribe({
      next: (created) => {
        this.productState.addProduct(created);
        this.toastService.show('Producto creado correctamente', 'success');
        this.form.reset({
          name: '',
          categoryId: null,
          tagId: null,
          unit: null,
          stock: null,
          reorderPoint: null,
        });
        bootstrap.Modal.getInstance(document.getElementById('createProductModal')!)?.hide();
      },
      error: (error) => {
        this.toastService.show('No se pudo crear: ' + error.error.message, 'danger');
      },
      complete: () => {
        this.loading = false;
      },
    });
  }
}