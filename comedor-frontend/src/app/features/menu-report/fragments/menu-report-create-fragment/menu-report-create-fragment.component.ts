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
import { MenuReportProductsFragmentComponent } from '../menu-report-products-fragment/menu-report-products-fragment.component';
import { Router } from '@angular/router';
import { MissingProductsResponse } from '@features/purchase-order/interfaces/missing-products.response';
import { finalize } from 'rxjs/internal/operators/finalize';
import { PurchaseOrderStateService } from '@features/purchase-order/services/purchase-state.service';

declare const bootstrap: any;

const LocalToday = new Date();

const localDate =
  LocalToday.getFullYear() +
  '-' +
  String(LocalToday.getMonth() + 1).padStart(2, '0') +
  '-' +
  String(LocalToday.getDate()).padStart(2, '0');

@Component({
  selector: 'app-menu-report-create-fragment',
  standalone: true,
  imports: [CommonModule, FormsModule, MenuReportProductsFragmentComponent],
  templateUrl: './menu-report-create-fragment.component.html',
})
export class MenuReportCreateFragmentComponent implements OnInit {
  private readonly menuReportService = inject(MenuReportApiService);
  private readonly menuReportState = inject(MenuReportStateService);
  private readonly userService = inject(UserService);
  private readonly toastService = inject(ToastService);
  readonly authState = inject(AuthStateService);
  private readonly router = inject(Router);
  private readonly purchaseOrderState = inject(PurchaseOrderStateService);

  missingProducts = signal<MissingProductsResponse[]>([]);

  goToBeneficiariesControl(): void {
    this.router.navigate(['/beneficiaries-control']);
  }

  readonly report = this.menuReportState.report;

  // Formulario de Creación
  selectedDishMenuId = signal<number | null>(null);
  quantityPrepared = signal<number | null>(null);
  dishMenus = signal<DishMenuResponse[]>([]);

  // Cocineras
  cookSearch = signal('');
  selectedCooks = signal<UserResponse[]>([]);
  allCooks = signal<UserResponse[]>([]);

  loading = signal(false);
  creating = signal(false);

  readonly today = new Date().toLocaleDateString('es-PE', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });

  ngOnInit(): void {
    this.loadTodayReport();
    this.loadCooks();
    this.loadDishMenus();
  }

  loadTodayReport(): void {
    console.log('Cargando reporte de hoy');
    if (!this.authState.hasPermission('MENU_REPORT_GET_BY_DATE')) return;
    this.loading.set(true);
    this.menuReportService.getByDate(localDate).subscribe({
      next: (report) => {
        this.menuReportState.setReport(report);
        console.log('Menu encontrado para hoy:', report);
        this.loading.set(false);
      },
      error: () => this.loading.set(false),
    });
  }

  loadDishMenus(): void {
    this.menuReportService.getDishMenus().subscribe({
      next: (menus) => this.dishMenus.set(menus),
    });
  }

  loadCooks(): void {
    this.userService.listActiveUsers().subscribe({
      next: (users) => this.allCooks.set(users),
    });
  }

  createReport(): void {
    if (!this.selectedDishMenuId() || !this.quantityPrepared() || this.creating()) return;
    this.creating.set(true);

    this.menuReportService
      .create({
        dishMenuId: this.selectedDishMenuId()!,
        quantityPrepared: this.quantityPrepared()!,
        cooks: this.selectedCooks().map((c) => c.user_id),
      })
      .pipe(
        finalize(() => {
          this.creating.set(false);
          this.loading.set(false);
        }),
      )
      .subscribe({
        next: () => {
          this.toastService.show('Reporte creado', 'success');
          this.loadTodayReport(); // Esto disparará el set(2)
          this.creating.set(false);
        },
        error: (err) => {
          if (err.status === 409 && err.error?.required) {
            console.log('Faltantes detectados al crear el reporte:', err.error.required);
            this.openMissingStockModal(err.error.required);

            return;
          }

          this.toastService.show(err.error?.message || 'Error al crear', 'danger');
        },
      });
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
    this.purchaseOrderState.setMissingProducts(this.missingProducts());

    this.router.navigate(['/purchase-order/create']);
  }
  // Helpers de cocineras
  addCook(cook: UserResponse) {
    this.selectedCooks.update((l) => [...l, cook]);
    this.cookSearch.set('');
  }

  removeCook(cook: UserResponse) {
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

  readonly canCreateReport = computed(() => {
    if (this.creating()) return false;
    if (!this.selectedDishMenuId()) return false;
    if (!this.quantityPrepared() || this.quantityPrepared()! <= 0) return false;
    if (this.selectedCooks().length === 0) return false;

    return true;
  });
}
