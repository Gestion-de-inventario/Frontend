import { Component, computed, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { DishApiService } from '@features/dish-menus/services/dish-api.service';
import { DishStateService } from '@features/dish-menus/services/dish-state.service';
import { DishDetailModalComponent } from '../dish-detail-modal/dish-detail-modal.component';

declare const bootstrap: any;

@Component({
  selector: 'app-dish-list-fragment',
  standalone: true,
  imports: [CommonModule, FormsModule, DishDetailModalComponent],
  templateUrl: './dish-list-fragment.component.html',
})
export class DishListFragmentComponent {
  private readonly dishService = inject(DishApiService);
  private readonly dishState = inject(DishStateService);

  search = signal('');
  onlyActive = signal(false);
  loading = signal<boolean>(false);

  readonly dishes = this.dishState.dishes;

  readonly filteredDishes = computed(() => {
    let list = this.dishes();
    if (this.onlyActive()) list = list.filter(d => d.status === 'ACTIVO');
    return list.filter(d => d.name.toLowerCase().includes(this.search().toLowerCase()));
  });

  constructor() {
    this.loadDishes();
  }

  loadDishes(): void {
    this.loading.set(true);

    this.dishService.listAll().subscribe({
        next: (dishes) => {
        this.dishState.setDishes(dishes);
        this.loading.set(false);
        },
        error: (err) => {
        console.error(err);
        this.loading.set(false);
        }
    });
    }

  openDish(dish: any): void {
    this.dishState.selectDish(dish);
    const modal = new bootstrap.Modal(document.getElementById('dishDetailModal'));
    modal.show();
  }
}