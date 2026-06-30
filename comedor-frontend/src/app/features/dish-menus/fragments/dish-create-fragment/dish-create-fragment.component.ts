import { Component, inject, signal } from '@angular/core';
import {
  FormControl,
  FormGroup,
  FormsModule,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
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
  loading = signal<boolean>(false);
  supplies: { productId: number | null; quantityNeeded: number | null }[] = [];

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
  submitted = signal(false);

  touchedSupplies = signal<Set<string>>(new Set());
  constructor() {
    this.productService.listByStatus('ACTIVO').subscribe({
      next: (products) => (this.products = products),
    });
  }

  addSupply(): void {
    this.supplies.push({
      productId: null,
      quantityNeeded: null,
    });
  }

  removeSupply(index: number): void {
    this.supplies.splice(index, 1);
  }

  openModal(): void {
    const modal = new bootstrap.Modal(document.getElementById('createDishModal'));
    modal.show();
  }

  resetForm(): void {
    this.form.reset({
      name: '',
    });

    this.supplies = [];

    this.submitted.set(false);
    this.touchedSupplies.set(new Set());
  }

  create(): void {
    this.submitted.set(true);
    this.form.markAllAsTouched();

    if (this.form.invalid || this.isSuppliesInvalid() || this.loading()) {
      return;
    }

    this.loading.set(true);

    this.dishService
      .create({
        name: this.form.getRawValue().name,
        supplies: this.supplies.map((s) => ({
          productId: s.productId!,
          quantityNeeded: s.quantityNeeded!,
        })),
      })
      .subscribe({
        next: (created) => {
          this.dishState.addDish(created);
          this.toastService.show('Plato creado correctamente', 'success');
          this.resetForm();
          this.loading.set(false);
          bootstrap.Modal.getInstance(document.getElementById('createDishModal')!)?.hide();
        },
        error: (error) => {
          this.toastService.show('No se pudo crear: ' + error.error?.message, 'danger');
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

  isSuppliesInvalid(): boolean {
    if (this.supplies.length === 0) return true;

    return this.supplies.some(
      (s) => !s.productId || this.isSupplyQuantityInvalid(s.quantityNeeded),
    );
  }
}
