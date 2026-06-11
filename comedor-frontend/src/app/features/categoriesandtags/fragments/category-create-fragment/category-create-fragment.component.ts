import { Component, inject, signal } from '@angular/core';
import { FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { CategoryApiService } from '@features/categoriesandtags/services/category-api.service';
import { CategoryStateService } from '@features/categoriesandtags/services/category-state.service';
import { ToastService } from '@shared/services/toast.service';

declare const bootstrap: any;

@Component({
  selector: 'app-category-create-fragment',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './category-create-fragment.component.html',
  styleUrl: './category-create-fragment.scss',
})
export class CategoryCreateFragmentComponent {
  private readonly categoryService = inject(CategoryApiService);
  private readonly categoryState = inject(CategoryStateService);
  private readonly toastService = inject(ToastService);

  loading = signal<boolean>(false);

  readonly form = new FormGroup({
    name: new FormControl('', {
      nonNullable: true,
      validators: [Validators.required],
    }),
  });

  openModal(): void {
    const modal = new bootstrap.Modal(document.getElementById('createCategoryModal'));
    modal.show();
  }

  create(): void {
    if (this.form.invalid || this.loading()) return;
    this.loading.set(true);

    this.categoryService.create(this.form.getRawValue()).subscribe({
      next: (created) => {
        this.categoryState.addCategory(created);
        this.toastService.show('Categoría creada correctamente', 'success');
        this.form.reset({ name: '' });
        bootstrap.Modal.getInstance(document.getElementById('createCategoryModal')!)?.hide();
      },
      error: (error) => {
        this.toastService.show('No se pudo crear: ' + error.error.message, 'danger');
        this.loading.set(false);
      },
      complete: () => {
        this.loading.set(false);
      },
    });
  }
}
