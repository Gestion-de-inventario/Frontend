import { Component, computed, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { CategoryApiService } from '@features/categoriesandtags/services/category-api.service';
import { CategoryStateService } from '@features/categoriesandtags/services/category-state.service';
import { CategoryDetailModalComponent } from '../category-detail-modal/category-detail-modal.component';

declare const bootstrap: any;

@Component({
  selector: 'app-category-list-fragment',
  standalone: true,
  imports: [CommonModule, FormsModule, CategoryDetailModalComponent],
  templateUrl: './category-list-fragment.component.html',
})
export class CategoryListFragmentComponent {
  private readonly categoryService = inject(CategoryApiService);
  private readonly categoryState = inject(CategoryStateService);

  search = signal('');
  onlyActive = signal(false);

  loading = signal<boolean>(true);

  readonly categories = this.categoryState.categories;

  readonly filteredCategories = computed(() => {
    let list = this.categories();

    if (this.onlyActive()) {
      list = list.filter((c) => c.status === 'ACTIVO');
    }

    return list.filter((c) =>
      c.name.toLowerCase().includes(this.search().toLowerCase())
    );
  });

  constructor() {
    this.loadCategories();
  }

  loadCategories(): void {
    this.loading.set(true);

    this.categoryService.listByStatus().subscribe({
      next: (list) => {
        this.categoryState.setCategories(list);
        this.loading.set(false);
      },
      error: (err) => {
        console.error('Error cargando categorías', err);
        this.loading.set(false);
      }
    });
  }

  openCategory(category: any): void {
    this.categoryState.selectCategory(category);
    const modal = new bootstrap.Modal(document.getElementById('categoryDetailModal'));
    modal.show();
  }
}