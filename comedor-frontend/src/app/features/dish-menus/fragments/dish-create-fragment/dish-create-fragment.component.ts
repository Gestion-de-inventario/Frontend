import { Component, inject } from '@angular/core';
import { FormControl, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { DishApiService } from '@features/dish-menus/services/dish-api.service';
import { DishStateService } from '@features/dish-menus/services/dish-state.service';
import { ProductApiService } from '@features/products/services/product-api.service';
import { ToastService } from '@shared/services/toast.service';
import { ProductResponse } from '@features/products/interfaces/product.response';

declare const bootstrap: any;

@Component({
  selector: 'app-dish-create-fragment',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, FormsModule],
  templateUrl: './dish-create-fragment.component.html',
})
export class DishCreateFragmentComponent {
  private readonly dishService = inject(DishApiService);
  private readonly dishState = inject(DishStateService);
  private readonly productService = inject(ProductApiService);
  private readonly toastService = inject(ToastService);

  products: ProductResponse[] = [];
  loading = false;
  supplies: { productId: number | null; quantityNeeded: number | null }[] = [];

  readonly form = new FormGroup({
    name: new FormControl('', { nonNullable: true, validators: [Validators.required] }),
  });

  constructor() {
    this.productService.listByStatus('ACTIVO').subscribe({
      next: (products) => (this.products = products),
    });
  }

  addSupply(): void {
    this.supplies.push({ productId: null, quantityNeeded: null });
  }

  removeSupply(index: number): void {
    this.supplies.splice(index, 1);
  }

  openModal(): void {
    const modal = new bootstrap.Modal(document.getElementById('createDishModal'));
    modal.show();
  }

  resetForm(): void {
    this.form.reset();
    this.supplies = [];
  }

  create(): void {
    if (this.form.invalid || this.supplies.length === 0 || this.loading) return;
    const invalidSupplies = this.supplies.some(s => !s.productId || !s.quantityNeeded);
    if (invalidSupplies) {
      this.toastService.show('Completa todos los insumos', 'warning');
      return;
    }
    this.loading = true;

    this.dishService.create({
      name: this.form.getRawValue().name,
      supplies: this.supplies.map(s => ({
        productId: s.productId!,
        quantityNeeded: s.quantityNeeded!,
      })),
    }).subscribe({
      next: (created) => {
        this.dishState.addDish(created);
        this.toastService.show('Plato creado correctamente', 'success');
        this.resetForm();
        bootstrap.Modal.getInstance(document.getElementById('createDishModal')!)?.hide();
      },
      error: (error) => {
        this.toastService.show('No se pudo crear: ' + error.error?.message, 'danger');
      },
      complete: () => { this.loading = false; },
    });
  }
}