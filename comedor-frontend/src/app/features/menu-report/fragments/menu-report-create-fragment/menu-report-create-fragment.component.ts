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
  private readonly toastService = inject(ToastService);
  readonly authState = inject(AuthStateService);

  readonly report = this.menuReportState.report;

  menu = signal('');
  cookSearch = signal('');
  selectedCooks = signal<UserResponse[]>([]);
  allCooks = signal<UserResponse[]>([]);
  
  // SOLUCIÓN: Convertidos a Signals para asegurar reactividad inmediata
  loading = signal(false);
  creating = signal(false);

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
  }

  loadTodayReport(): void {
    if (!this.authState.hasPermission('MENU_REPORT_GET_BY_DATE')) return;
    
    this.loading.set(true); // <-- Actualizado con .set()
    this.menuReportService.getByDate(this.todayIso).subscribe({
      next: (report) => {
        this.menuReportState.setReport(report);
        this.loading.set(false); // <-- Actualizado con .set()
      },
      error: () => {
        this.loading.set(false); // <-- Actualizado con .set()
      },
    });
  }

  loadCooks(): void {
    this.userService.listActiveUsers().subscribe({
      next: (users) => this.allCooks.set(users),
    });
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
    this.creating.set(true); // <-- Actualizado con .set()

    this.menuReportService.create({
      menu: this.menu(),
      cooks: this.selectedCooks().map((c) => c.user_id),
    }).subscribe({
      next: () => {
        this.toastService.show('Reporte creado correctamente', 'success');
        this.loadTodayReport();
      },
      error: (error) => {
        this.toastService.show('No se pudo crear: ' + error.error.message, 'danger');
        this.creating.set(false); // <-- Actualizado con .set()
      },
      complete: () => {
        this.creating.set(false); // <-- Actualizado con .set()
      },
    });
  }
}