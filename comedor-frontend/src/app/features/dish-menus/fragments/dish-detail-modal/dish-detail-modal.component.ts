import { Component, computed, inject } from '@angular/core';
import { FormControl, FormGroup, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { AuthStateService } from '@core/auth/services/auth-state.service';
import { ToastService } from '@shared/services/toast.service';
import { DishApiService } from '@features/dish-menus/services/dish-api.service';
import { DishStateService } from '@features/dish-menus/services/dish-state.service';
import { ProductApiService } from '@features/products/services/product-api.service';
import { ProductResponse } from '@features/products/interfaces/product.response';

@Component({
  selector: 'app-dish-detail-modal',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, FormsModule],
  templateUrl: './dish-detail-modal.component.html',
})
export class DishDetailModalComponent {
  readonly authState = inject(AuthStateService);
  private readonly dishState = inject(DishStateService);
  private readonly dishService = inject(DishApiService);
  private readonly productService = inject(ProductApiService);
  private readonly toastService = inject(ToastService);

  readonly dish = computed(() => this.dishState.selectedDish());

  mode: 'view' | 'edit' = 'view';
  loading = false;
  products: ProductResponse[] = [];
  editSupplies: { productId: number; quantityNeeded: number }[] = [];

  readonly form = new FormGroup({
    name: new FormControl('', { nonNullable: true }),
  });

  constructor() {
    this.productService.listByStatus('ACTIVO').subscribe({
      next: (products) => (this.products = products),
    });
  }

  openEdit(): void {
    const dish = this.dish();
    if (!dish) return;
    this.form.patchValue({ name: dish.name });
    this.editSupplies = dish.supplies.map(s => ({
      productId: s.productId,
      quantityNeeded: Number(s.quantityNeeded),
    }));
    this.mode = 'edit';
  }

  addEditSupply(): void {
    this.editSupplies.push({ productId: this.products[0]?.id, quantityNeeded: 0 });
  }

  removeEditSupply(index: number): void {
    this.editSupplies.splice(index, 1);
  }

  goBack(): void {
    this.mode = 'view';
  }

  save(): void {
    const dish = this.dish();
    if (!dish || this.loading) return;
    this.loading = true;

    this.dishService.edit(dish.id, {
      name: this.form.value.name || undefined,
      supplies: this.editSupplies,
    }).subscribe({
      next: (updated) => {
        this.dishState.updateDish(updated);
        this.toastService.show('Plato actualizado correctamente', 'success');
        this.mode = 'view';
      },
      error: (error) => {
        this.toastService.show('No se pudo actualizar: ' + error.error?.message, 'danger');
      },
      complete: () => { this.loading = false; },
    });
  }

  changeStatus(status: string): void {
    const dish = this.dish();
    if (!dish || this.loading) return;
    this.loading = true;

    this.dishService.changeStatus(dish.id, status).subscribe({
      next: (updated) => {
        this.dishState.updateDish(updated);
        this.toastService.show(
          status === 'ACTIVO' ? 'Plato activado' : 'Plato desactivado',
          status === 'ACTIVO' ? 'success' : 'warning'
        );
      },
      error: (error) => {
        this.toastService.show('No se pudo cambiar el estado: ' + error.error?.message, 'danger');
      },
      complete: () => { this.loading = false; },
    });
  }

  close(): void {
    this.mode = 'view';
    this.dishState.clearSelectedDish();
  }
}