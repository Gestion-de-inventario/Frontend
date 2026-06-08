import { Injectable, signal } from '@angular/core';
import { DishMenuResponse } from '../interfaces/dish-menu.response';

@Injectable({ providedIn: 'root' })
export class DishStateService {
  private readonly _dishes = signal<DishMenuResponse[]>([]);
  readonly dishes = this._dishes.asReadonly();

  private readonly _selectedDish = signal<DishMenuResponse | null>(null);
  readonly selectedDish = this._selectedDish.asReadonly();

  setDishes(dishes: DishMenuResponse[]): void {
    this._dishes.set(dishes);
  }

  selectDish(dish: DishMenuResponse): void {
    this._selectedDish.set(dish);
  }

  clearSelectedDish(): void {
    this._selectedDish.set(null);
  }

  addDish(dish: DishMenuResponse): void {
    this._dishes.update((list) => [dish, ...list]);
  }

  updateDish(updated: DishMenuResponse): void {
    this._dishes.update((list) =>
      list.map((d) => (d.id === updated.id ? updated : d))
    );
    const selected = this._selectedDish();
    if (selected && selected.id === updated.id) {
      this._selectedDish.set(updated);
    }
  }
}