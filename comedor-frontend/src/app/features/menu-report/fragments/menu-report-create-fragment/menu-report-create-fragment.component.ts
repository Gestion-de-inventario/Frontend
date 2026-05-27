import { Component, OnInit, computed, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MenuReportApiService } from '@features/menu-report/services/menu-report-api.service';
import { MenuReportStateService } from '@features/menu-report/services/menu-report-state.service';
import { AuthStateService } from '@core/auth/services/auth-state.service';
import { UserService } from '@features/users/services/user-api.service';
import { UserResponse } from '@features/users/interfaces/user.response';
import { ToastService } from '@shared/services/toast.service';
import { MenuReportProductsFragmentComponent } from '../menu-report-products-fragment/menu-report-products-fragment.component';
import { MenuReportBeneficiariesFragmentComponent } from '../menu-report-beneficiaries-fragment/menu-report-beneficiaries-fragment.component';
import { MenuReportSummaryFragmentComponent } from '../menu-report-summary-fragment/menu-report-summary-fragment.component';
import { DishMenuResponse } from '@features/menu-report/interfaces/menu-report.response';

@Component({
  selector: 'app-menu-report-create-fragment',
  standalone: true,
  imports: [
    CommonModule, FormsModule,
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
  private readonly toastService = inject(ToastService);
  readonly authState = inject(AuthStateService);

  readonly report = this.menuReportState.report;
  
  // Control de Pasos (1 al 4)
  currentStep = signal(1);

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
    weekday: 'long', year: 'numeric', month: 'long', day: 'numeric'
  });
  readonly todayIso = new Date().toISOString().split('T')[0];

  ngOnInit(): void {
    this.loadTodayReport();
    this.loadCooks();
    this.loadDishMenus();
  }

  loadTodayReport(): void {
    if (!this.authState.hasPermission('MENU_REPORT_GET_BY_DATE')) return;
    this.loading.set(true);
    this.menuReportService.getByDate(this.todayIso).subscribe({
      next: (report) => {
        this.menuReportState.setReport(report);
        // Si ya existe reporte, saltamos al paso 2 (Productos)
        this.currentStep.set(2);
        this.loading.set(false);
      },
      error: () => this.loading.set(false),
    });
  }

  loadDishMenus(): void {
    this.menuReportService.getDishMenus().subscribe({
      next: (menus) => this.dishMenus.set(menus)
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

    this.menuReportService.create({
      dishMenuId: this.selectedDishMenuId()!,
      quantityPrepared: this.quantityPrepared()!,
      cooks: this.selectedCooks().map((c) => c.user_id),
    }).subscribe({
      next: () => {
        this.toastService.show('Reporte creado', 'success');
        this.loadTodayReport(); // Esto disparará el set(2)
        this.creating.set(false);
      },
      error: (err) => {
        this.toastService.show(err.error?.message || 'Error al crear', 'danger');
        this.creating.set(false);
      }
    });
  }

  // Métodos de navegación
  nextStep() { this.currentStep.update(s => s + 1); }
  prevStep() { this.currentStep.update(s => s - 1); }

  // Helpers de cocineras
  addCook(cook: UserResponse) { this.selectedCooks.update(l => [...l, cook]); this.cookSearch.set(''); }
  removeCook(cook: UserResponse) { this.selectedCooks.update(l => l.filter(c => c.user_id !== cook.user_id)); }
  filteredCooks = computed(() => {
    const term = this.cookSearch().toLowerCase();
    return this.allCooks().filter(c => !this.selectedCooks().some(s => s.user_id === c.user_id) && 
           (`${c.name} ${c.lastname}`.toLowerCase().includes(term) || c.dni.includes(term)));
  });
}