import { Component, computed, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AuthStateService } from '@core/auth/services/auth-state.service';
import { ToastService } from '@shared/services/toast.service';
import { CategoryApiService } from '@features/categoriesandtags/services/category-api.service';
import { CategoryStateService } from '@features/categoriesandtags/services/category-state.service';

@Component({
  selector: 'app-category-detail-modal',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './category-detail-modal.component.html',
})
export class CategoryDetailModalComponent {
  readonly authState = inject(AuthStateService);
  private readonly categoryState = inject(CategoryStateService);
  private readonly categoryService = inject(CategoryApiService);
  private readonly toastService = inject(ToastService);

  readonly category = computed(() => this.categoryState.selectedCategory());

  loading = signal<boolean>(false);

  changeStatus(status: string): void {
    const category = this.category();
    if (!category || this.loading()) return;

    this.loading.set(true);

    this.categoryService.changeStatus(category.id, status).subscribe({
      next: (updated) => {
        this.categoryState.updateCategory(updated);
        this.toastService.show(
          status === 'ACTIVO' ? 'Categoría activada' : 'Categoría desactivada',
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
    this.categoryState.clearSelectedCategory();
  }
}
