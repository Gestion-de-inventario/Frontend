import { Component, OnInit, computed, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { forkJoin, of } from 'rxjs';
import { concatMap } from 'rxjs/operators';
import { MenuReportApiService } from '@features/menu-report/services/menu-report-api.service';
import { MenuReportStateService } from '@features/menu-report/services/menu-report-state.service';
import { AuthStateService } from '@core/auth/services/auth-state.service';
import { UserService } from '@features/users/services/user-api.service';
import { UserResponse } from '@features/users/interfaces/user.response';
import { ToastService } from '@shared/services/toast.service';
import { ProductApiService } from '@features/products/services/product-api.service';
import { ProductStateService } from '@features/products/services/product-state.service';
import { MenuReportProductsFragmentComponent } from '../menu-report-products-fragment/menu-report-products-fragment.component';
import { MenuReportBeneficiariesFragmentComponent } from '../menu-report-beneficiaries-fragment/menu-report-beneficiaries-fragment.component';
import { MenuReportSummaryFragmentComponent } from '../menu-report-summary-fragment/menu-report-summary-fragment.component';
import { MENU_TEMPLATES, MenuTemplate, TemplateIngredient } from '@features/menu-report/menu-report-templates';

@Component({
  selector: 'app-menu-report-create-fragment',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    MenuReportProductsFragmentComponent,
    MenuReportBeneficiariesFragmentComponent,
    MenuReportSummaryFragmentComponent,
  ],
  templateUrl: './menu-report-create-fragment.component.html',
})
export class MenuReportCreateFragmentComponent implements OnInit {
  private readonly menuReportService = inject(MenuReportApiService);
  private readonly menuReportState = inject(MenuReportStateService);
  private readonly userService = inject(UserService);
  private readonly productService = inject(ProductApiService);
  private readonly productState = inject(ProductStateService);
  private readonly toastService = inject(ToastService);
  readonly authState = inject(AuthStateService);

  readonly report = this.menuReportState.report;

  menu = signal('');
  cookSearch = signal('');
  selectedCooks = signal<UserResponse[]>([]);
  allCooks = signal<UserResponse[]>([]);
  loading = signal(false);
  creating = signal(false);
  currentStep = signal(1);
  selectedTemplate = signal<MenuTemplate | null>(null);
  templateItems = signal<TemplateIngredient[]>([]);

  readonly templates = MENU_TEMPLATES;

  readonly steps = [
    { id: 1, label: 'Menú', emoji: '🍽️' },
    { id: 2, label: 'Productos', emoji: '📦' },
    { id: 3, label: 'Recojo', emoji: '👥' },
    { id: 4, label: 'Resumen', emoji: '📊' },
  ];

  readonly today = new Date().toLocaleDateString('es-PE', {
    weekday: 'long', year: 'numeric', month: 'long', day: 'numeric'
  });

  readonly todayIso = new Date().toISOString().split('T')[0];

  readonly filteredCooks = computed(() => {
    const term = this.cookSearch().toLowerCase();
    if (!term) return [];
    return this.allCooks().filter(
      (c) =>
        !this.selectedCooks().some((s) => s.user_id === c.user_id) &&
        (`${c.name} ${c.lastname}`.toLowerCase().includes(term) ||
          c.dni.includes(term))
    );
  });

  ngOnInit(): void {
    this.loadTodayReport();
    this.loadCooks();
    // cargamos productos en state para que el fragment de productos los tenga
    this.productService.listByStatus('ACTIVO').subscribe((products) => {
      this.productState.setProducts(products);
    });
  }

  loadTodayReport(): void {
    if (!this.authState.hasPermission('MENU_REPORT_GET_BY_DATE')) return;
    this.loading.set(true);
    this.menuReportService.getByDate(this.todayIso).subscribe({
      next: (report) => {
        this.menuReportState.setReport(report);
        this.loading.set(false);
      },
      error: () => {
        this.loading.set(false);
      },
    });
  }

  loadCooks(): void {
    this.userService.listActiveUsers().subscribe({
      next: (users) => this.allCooks.set(users),
    });
  }

  selectTemplate(template: MenuTemplate): void {
    this.selectedTemplate.set(template);
    this.templateItems.set([...template.ingredients]);
    this.menu.set(template.name);
  }

  updateTemplateItemAmount(productName: string, amount: number): void {
    this.templateItems.update((items) =>
      items.map((item) =>
        item.productName === productName ? { ...item, amount } : item
      )
    );
  }

  removeTemplateItem(productName: string): void {
    this.templateItems.update((items) =>
      items.filter((item) => item.productName !== productName)
    );
  }

  addCook(cook: UserResponse): void {
    this.selectedCooks.update((list) => [...list, cook]);
    this.cookSearch.set('');
  }

  removeCook(cook: UserResponse): void {
    this.selectedCooks.update((list) => list.filter((c) => c.user_id !== cook.user_id));
  }

  createReport(): void {
    if (this.menu().trim().length === 0 || this.creating()) return;
    this.creating.set(true);

    this.menuReportService.create({
      menu: this.menu(),
      cooks: this.selectedCooks().map((c) => c.user_id),
    }).pipe(
      concatMap((created) => {
        const items = this.templateItems();
        const allProducts = this.productState.products();

        if (items.length === 0) {
          // sin plantilla, solo recargamos
          return of(created);
        }

        // matcheamos cada item de la plantilla con el producto real del almacén
        const requests = items
          .map((item) => {
            const product = allProducts.find(
              (p) => p.name.toUpperCase() === item.productName.toUpperCase()
            );
            if (!product) return null;
            return this.menuReportService.addProduct(created.id, {
              productoId: product.id,
              amount: item.amount,
              productSource: 'DONACION',
              unitPrice: 0,
            });
          })
          .filter((r) => r !== null);

        if (requests.length === 0) return of(created);

        // ejecutamos todos en paralelo
        return forkJoin(requests);
      })
    ).subscribe({
      next: () => {
        this.toastService.show('Reporte creado correctamente', 'success');
        this.selectedTemplate.set(null);
        this.templateItems.set([]);
        this.loadTodayReport();
        // vamos directo al paso 2 para revisar los productos
        setTimeout(() => this.currentStep.set(2), 800);
      },
      error: (error) => {
        this.toastService.show('Error al crear: ' + (error?.error?.message ?? 'intenta de nuevo'), 'danger');
        this.creating.set(false);
      },
      complete: () => {
        this.creating.set(false);
      },
    });
  }
}