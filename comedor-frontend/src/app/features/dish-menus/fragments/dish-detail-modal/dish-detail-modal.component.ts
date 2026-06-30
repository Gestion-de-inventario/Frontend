import { Component, computed, inject, signal } from '@angular/core';
import {
  FormControl,
  FormGroup,
  FormsModule,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
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
  loading = signal<boolean>(false);
  products: ProductResponse[] = [];
  editSupplies: { productId: number | null; quantityNeeded: number | null }[] = [];

  submitted = signal(false);

  touchedSupplies = signal<Set<string>>(new Set());

  readonly form = new FormGroup({
    name: new FormControl('', {
      nonNullable: true,
      validators: [
        Validators.required,
        Validators.minLength(2),
        Validators.maxLength(80),
        Validators.pattern(/^[A-Za-zÁÉÍÓÚáéíóúÑñ\s]+$/),
      ],
    }),
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

    this.editSupplies = dish.supplies.map((s) => ({
      productId: s.productId,
      quantityNeeded: Number(s.quantityNeeded),
    }));

    this.submitted.set(false);
    this.touchedSupplies.set(new Set());

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
    this.submitted.set(false);
    this.touchedSupplies.set(new Set());
  }

  close(): void {
    this.mode = 'view';
    this.submitted.set(false);
    this.touchedSupplies.set(new Set());
    this.dishState.clearSelectedDish();
  }

  save(): void {
    const dish = this.dish();

    this.submitted.set(true);
    this.form.markAllAsTouched();

    if (!dish || this.loading()) return;

    if (this.form.invalid || this.isEditSuppliesInvalid()) {
      return;
    }

    this.loading.set(true);

    this.dishService
      .edit(dish.id, {
        name: this.form.getRawValue().name.trim(),
        supplies: this.editSupplies.map((s) => ({
          productId: s.productId!,
          quantityNeeded: s.quantityNeeded!,
        })),
      })
      .subscribe({
        next: (updated) => {
          this.dishState.updateDish(updated);
          this.toastService.show('Plato actualizado correctamente', 'success');
          this.mode = 'view';
          this.loading.set(false);
        },
        error: (error) => {
          this.toastService.show('No se pudo actualizar: ' + error.error?.message, 'danger');
          this.loading.set(false);
        },
        complete: () => {
          this.loading.set(false);
        },
      });
  }

  changeStatus(status: string): void {
    const dish = this.dish();
    if (!dish || this.loading()) return;
    this.loading.set(true);

    this.dishService.changeStatus(dish.id, status).subscribe({
      next: (updated) => {
        this.dishState.updateDish(updated);
        this.toastService.show(
          status === 'ACTIVO' ? 'Plato activado' : 'Plato desactivado',
          status === 'ACTIVO' ? 'success' : 'warning',
        );
        this.loading.set(false);
      },
      error: (error) => {
        this.toastService.show('No se pudo cambiar el estado: ' + error.error?.message, 'danger');
        this.loading.set(false);
      },
      complete: () => {
        this.loading.set(false);
      },
    });
  }

  private supplyFieldKey(index: number, field: 'product' | 'quantity'): string {
    return `${index}-${field}`;
  }

  markSupplyTouched(index: number, field: 'product' | 'quantity'): void {
    this.touchedSupplies.update((fields) => {
      const copy = new Set(fields);
      copy.add(this.supplyFieldKey(index, field));
      return copy;
    });
  }

  shouldShowSupplyError(index: number, field: 'product' | 'quantity'): boolean {
    return this.submitted() || this.touchedSupplies().has(this.supplyFieldKey(index, field));
  }

  isRequiredValue(value: number | null | undefined): boolean {
    return value === null || value === undefined || value === 0 || Number.isNaN(Number(value));
  }

  isPositiveNumber(value: number | null | undefined): boolean {
    return Number(value) > 0;
  }

  isDecimalOrInteger(value: number | null | undefined): boolean {
    if (value === null || value === undefined) return false;

    return /^\d+(\.\d+)?$/.test(String(value));
  }

  isSupplyQuantityInvalid(quantity: number | null): boolean {
    return (
      this.isRequiredValue(quantity) ||
      !this.isDecimalOrInteger(quantity) ||
      !this.isPositiveNumber(quantity)
    );
  }

  isEditSuppliesInvalid(): boolean {
    if (this.editSupplies.length === 0) return true;

    return this.editSupplies.some(
      (s) => !s.productId || this.isSupplyQuantityInvalid(s.quantityNeeded),
    );
  }
}
