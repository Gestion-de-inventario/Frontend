import { Component, inject, OnInit, signal } from '@angular/core';
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
  styleUrl: './product-create-fragment.component.scss',
})
export class ProductCreateFragmentComponent implements OnInit {
  private readonly productService = inject(ProductApiService);
  private readonly productState = inject(ProductStateService);
  private readonly categoryService = inject(CategoryApiService);
  private readonly tagService = inject(TagApiService);
  private readonly toastService = inject(ToastService);

  readonly categories = signal<CategoryResponse[]>([]);
  readonly tags = signal<TagResponse[]>([]);
  readonly loading = signal(false);

  readonly form = new FormGroup({
    name: new FormControl('', {
      nonNullable: true,
      validators: [
        Validators.required,
        Validators.minLength(2),
        Validators.maxLength(50),
        Validators.pattern(/^[A-Za-zÁÉÍÓÚáéíóúÑñ\s]+$/),
      ],
    }),

    categoryId: new FormControl<number | null>(null, {
      validators: [Validators.required],
    }),

    tagId: new FormControl<number | null>(null),

    unit: new FormControl<string | null>(null, {
      validators: [Validators.required],
    }),

    reorderPoint: new FormControl<number | null>(null, {
      validators: [Validators.required, Validators.min(1)],
    }),
  });

  ngOnInit(): void {
    this.loadCategories();
    this.loadTags();
  }

  private loadCategories(): void {
    this.categoryService.listByStatus('ACTIVO').subscribe({
      next: (categories) => {
        this.categories.set(categories.map((category) => ({ ...category })));
      },
      error: (error) => {
        console.error('Error cargando categorías', error);
        this.categories.set([]);
      },
    });
  }

  private loadTags(): void {
    this.tagService.listByStatus('ACTIVO').subscribe({
      next: (tags) => {
        this.tags.set(tags.map((tag) => ({ ...tag })));
      },
      error: (error) => {
        console.error('Error cargando etiquetas', error);
        this.tags.set([]);
      },
    });
  }

  openModal(): void {
    const modalElement = document.getElementById('createProductModal');

    if (!modalElement) {
      return;
    }

    bootstrap.Modal.getOrCreateInstance(modalElement).show();
  }

  create(): void {
    if (this.form.invalid || this.loading()) {
      this.form.markAllAsTouched();
      return;
    }

    const value = this.form.getRawValue();

    this.loading.set(true);

    this.productService
      .create({
        name: value.name,
        categoryId: value.categoryId!,
        tagId: value.tagId,
        unit: value.unit!,
        reorderPoint: value.reorderPoint!,
      })
      .subscribe({
        next: (created) => {
          this.productState.addProduct(created);
          this.toastService.show('Producto creado correctamente', 'success');

          this.form.reset({
            name: '',
            categoryId: null,
            tagId: null,
            unit: null,
            reorderPoint: null,
          });

          const modalElement = document.getElementById('createProductModal');

          if (modalElement) {
            bootstrap.Modal.getInstance(modalElement)?.hide();
          }
        },
        error: (error) => {
          const message = error?.error?.message ?? 'Error desconocido';

          this.toastService.show(`No se pudo crear: ${message}`, 'danger');

          this.loading.set(false);
        },
        complete: () => {
          this.loading.set(false);
        },
      });
  }

  onNameInput(event: Event, controlName: 'name'): void {
    const input = event.target as HTMLInputElement;

    const cleaned = input.value.replace(/[^A-Za-zÁÉÍÓÚáéíóúÑñ\s]/g, '');

    if (cleaned !== input.value) {
      this.form.controls[controlName].setValue(cleaned, {
        emitEvent: false,
      });
    }
  }
}
