import { Component, OnInit, computed, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MenuReportApiService } from '@features/menu-report/services/menu-report-api.service';
import { MenuReportStateService } from '@features/menu-report/services/menu-report-state.service';
import { AuthStateService } from '@core/auth/services/auth-state.service';
import { UserService } from '@features/users/services/user-api.service';
import { UserResponse } from '@features/users/interfaces/user.response';
import { ToastService } from '@shared/services/toast.service';
import { DishMenuResponse } from '@features/menu-report/interfaces/menu-report.response';
import { Router } from '@angular/router';
import { MissingProductsResponse } from '@features/order-in/interfaces/missing-products.response';
import { finalize } from 'rxjs/internal/operators/finalize';
import { InventoryOrderStateService } from '@features/order-in/services/inventary-order-state.service';
import { forkJoin } from 'rxjs';
import { SearchSelectComponent } from '@shared/components/search-select/search-select';

declare const bootstrap: any;

@Component({
  selector: 'app-menu-report-create-fragment',
  standalone: true,
  imports: [CommonModule, FormsModule, SearchSelectComponent],
  templateUrl: './menu-report-create-fragment.component.html',
  styleUrls: ['./menu-report-create-fragment.component.scss'],
})
export class MenuReportCreateFragmentComponent implements OnInit {
  private readonly menuReportService = inject(MenuReportApiService);
  private readonly menuReportState = inject(MenuReportStateService);

  private readonly userService = inject(UserService);
  private readonly toastService = inject(ToastService);
  readonly authState = inject(AuthStateService);
  private readonly router = inject(Router);
  private readonly iventoryOrderState = inject(InventoryOrderStateService);

  submitted = signal(false);

  quantityTouched = signal(false);
  dishTouched = signal(false);
  dateTouched = signal(false);
  cooksTouched = signal(false);

  menuReportId = signal<number | null>(null);

  cookDisplay = (cook: UserResponse) => `${cook.name} ${cook.lastname} - DNI: ${cook.dni}`;

  canCreate = this.authState.hasPermission('MENU_REPORT_CREATE_REPORT');

  missingProducts = signal<MissingProductsResponse[]>([]);

  goToBeneficiariesControl(id: number): void {
    this.router.navigate(['/beneficiaries-control/manage/', id]);
  }

  goList(): void {
    this.router.navigate(['/history/menu-report']);
  }
  // Formulario de Creación
  selectedDishMenuId = signal<number | null>(null);
  quantityPrepared = signal<number | null>(null);
  dishMenus = signal<DishMenuResponse[]>([]);
  createdDate = signal<string>(this.getPeruToday());

  // Cocineras
  cookSearch = signal('');
  selectedCooks = signal<UserResponse[]>([]);
  allCooks = signal<UserResponse[]>([]);

  creating = signal(false);
  loading = signal(true);

  created = signal(false);

  minDate = signal<string>(this.getPeruToday());

  maxDate = signal<string>(this.getPeruEndOfYear());

  readonly today = new Date().toLocaleDateString('es-PE', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });

  ngOnInit(): void {
    this.loadInitialData();
  }

  loadInitialData(): void {
    this.loading.set(true);

    forkJoin({
      cooks: this.userService.listActiveUsers(),
      dishMenus: this.menuReportService.getDishMenus(),
    }).subscribe({
      next: ({ cooks, dishMenus }) => {
        this.allCooks.set(cooks);

        this.dishMenus.set(dishMenus);

        this.loading.set(false);
        const duplicate = this.menuReportState.duplicateSourceReport();
        if (duplicate) {
          this.selectedDishMenuId.set(duplicate.dishId);

          this.quantityPrepared.set(duplicate.quantityPrepared);
          this.toastService.show('Datos copiados desde la orden anterior', 'warning');
          this.menuReportState.clearDuplicateSource();
        }
      },

      error: () => {
        this.loading.set(false);

        this.toastService.show('Error al cargar información inicial', 'danger');
      },
    });
  }

  createReport(): void {
    this.submitted.set(true);
    this.cooksTouched.set(true);

    if (
      !this.selectedDishMenuId() ||
      !this.quantityPrepared() ||
      this.creating() ||
      !this.createdDate()
    )
      return;
    this.creating.set(true);

    this.menuReportService
      .create({
        dishMenuId: this.selectedDishMenuId()!,
        quantityPrepared: this.quantityPrepared()!,
        cooks: this.selectedCooks().map((c) => c.user_id),
        createDate: this.createdDate()!,
      })
      .pipe(
        finalize(() => {
          this.creating.set(false);
        }),
      )
      .subscribe({
        next: (res) => {
          this.toastService.show('Orden creada', 'success');
          this.created.set(true);
          this.menuReportId.set(res.id);
        },
        error: (err) => {
          if (err.status === 409 && err.error?.required) {
            this.openMissingStockModal(err.error.required);
            return;
          }
          this.toastService.show(err.error?.message || 'Error al crear', 'danger');
        },
      });
  }
  private getPeruToday(): string {
    return new Intl.DateTimeFormat('en-CA', {
      timeZone: 'America/Lima',
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
    }).format(new Date());
  }

  private getPeruEndOfYear(): string {
    const year = new Intl.DateTimeFormat('en', {
      timeZone: 'America/Lima',
      year: 'numeric',
    }).format(new Date());

    return `${year}-12-31`;
  }

  createAnother(): void {
    this.created.set(false);

    this.selectedDishMenuId.set(null);
    this.quantityPrepared.set(null);
    this.selectedCooks.set([]);
    this.createdDate.set(this.getPeruToday());

    this.submitted.set(false);
    this.quantityTouched.set(false);
    this.dishTouched.set(false);
    this.dateTouched.set(false);
    this.cooksTouched.set(false);
  }

  openMissingStockModal(faltantes: MissingProductsResponse[]): void {
    this.missingProducts.set(faltantes);

    const modal = new bootstrap.Modal(document.getElementById('missingStockModal'));

    modal.show();
  }

  goToCreatePurchase(): void {
    const modalElement = document.getElementById('missingStockModal');

    const modal = bootstrap.Modal.getInstance(modalElement);

    modal?.hide();
    this.iventoryOrderState.setMissingProducts(this.missingProducts());

    this.router.navigate(['/purchase-order/create']);
  }
  // Helpers de cocineras
  addCook(cook: UserResponse): void {
    this.cooksTouched.set(true);
    this.selectedCooks.update((current) => {
      if (current.some((c) => c.user_id === cook.user_id)) {
        return current;
      }

      return [...current, cook];
    });
  }

  removeCook(cook: UserResponse) {
    this.cooksTouched.set(true);
    this.selectedCooks.update((l) => l.filter((c) => c.user_id !== cook.user_id));
  }

  readonly filteredCooks = computed(() => {
    const term = this.cookSearch().trim().toLowerCase();

    if (!term) return [];

    return this.allCooks()
      .filter(
        (c) =>
          !this.selectedCooks().some((s) => s.user_id === c.user_id) &&
          (`${c.name} ${c.lastname}`.toLowerCase().includes(term) || c.dni.includes(term)),
      )
      .slice(0, 5);
  });

  availableCooks = computed(() => {
    const selectedIds = new Set(this.selectedCooks().map((c) => c.user_id));

    const result = this.allCooks().filter((cook) => !selectedIds.has(cook.user_id));
    return result;
  });

  readonly canCreateReport = computed(() => {
    if (this.creating()) return false;

    if (!this.selectedDishMenuId()) return false;

    if (this.isQuantityPreparedInvalid()) return false;

    if (this.selectedCooks().length === 0) return false;

    if (!this.createdDate()) return false;

    if (this.createdDate() < this.minDate()) return false;

    if (this.createdDate() > this.maxDate()) return false;

    return true;
  });

  isRequiredValue(value: number | null | undefined): boolean {
    return value === null || value === undefined || value === 0 || Number.isNaN(Number(value));
  }

  isPositiveNumber(value: number | null | undefined): boolean {
    return Number(value) > 0;
  }

  isInteger(value: number | null | undefined): boolean {
    if (value === null || value === undefined) return false;

    return Number.isInteger(Number(value));
  }

  isQuantityPreparedInvalid(): boolean {
    const value = this.quantityPrepared();

    return this.isRequiredValue(value) || !this.isInteger(value) || !this.isPositiveNumber(value);
  }

  shouldShowQuantityError(): boolean {
    return this.submitted() || this.quantityTouched();
  }

  shouldShowDishError(): boolean {
    return this.submitted() || this.dishTouched();
  }

  shouldShowDateError(): boolean {
    return this.submitted() || this.dateTouched();
  }

  shouldShowCooksError(): boolean {
    return this.submitted() || this.cooksTouched();
  }

  limitQuantityDigits(event: Event): void {
    this.quantityTouched.set(true);

    const input = event.target as HTMLInputElement;

    input.value = input.value.replace(/\D/g, '').slice(0, 5);

    this.quantityPrepared.set(input.value ? Number(input.value) : null);
  }
}
