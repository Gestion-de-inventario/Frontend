import { Injectable, signal } from '@angular/core';
import { CategoryResponse } from '../interfaces/category.response';

@Injectable({
  providedIn: 'root',
})
export class CategoryStateService {
  private readonly _categories = signal<CategoryResponse[]>([]);
  readonly categories = this._categories.asReadonly();

  private readonly _selectedCategory = signal<CategoryResponse | null>(null);
  readonly selectedCategory = this._selectedCategory.asReadonly();

  setCategories(categories: CategoryResponse[]): void {
    this._categories.set(categories);
  }

  selectCategory(category: CategoryResponse): void {
    this._selectedCategory.set(category);
  }

  clearSelectedCategory(): void {
    this._selectedCategory.set(null);
  }

  addCategory(category: CategoryResponse): void {
    this._categories.update((list) => [category, ...list]);
  }

  updateCategory(updated: CategoryResponse): void {
    this._categories.update((list) =>
      list.map((c) => (c.id === updated.id ? updated : c))
    );
    const selected = this._selectedCategory();
    if (selected && selected.id === updated.id) {
      this._selectedCategory.set(updated);
    }
  }
}