import { Component, computed, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { finalize } from 'rxjs/operators';

import { Router } from '@angular/router';

import { MenuReportApiService } from '../../services/menu-report-api.service';

import { DishMenuResponse, MenuReportResponse } from '../../interfaces/menu-report.response';

import { AuthStateService } from '@core/auth/services/auth-state.service';
import { MenuReportStateService } from '@features/menu-report/services/menu-report-state.service';
import { ToastService } from '@shared/services/toast.service';
import { EditMenuReportRequest } from '@features/menu-report/interfaces/menu-report.request';
import { SearchSelectComponent } from '@shared/components/search-select/search-select';
import { UserResponse } from '@features/users/interfaces/user.response';
import { forkJoin } from 'rxjs';
import { UserService } from '@features/users/services/user-api.service';

declare const bootstrap: any;

@Component({
  selector: 'app-list-menu-report-fragment',
  standalone: true,
  imports: [CommonModule, FormsModule, SearchSelectComponent],
  templateUrl: './list-menu-report-fragment.component.html',
  styleUrls: ['./list-menu-report-fragment.component.scss'],
})
export class ListMenuReportFragmentComponent {
  private readonly menuReportService = inject(MenuReportApiService);
  readonly menuReportState = inject(MenuReportStateService);
  private readonly router = inject(Router);
  private readonly toastService = inject(ToastService);

  readonly authState = inject(AuthStateService);

  private readonly userService = inject(UserService);

  canList = this.authState.hasPermission('MENU_REPORT_LIST_ALL');

  canCreate = this.authState.hasPermission('MENU_REPORT_CREATE_REPORT');

  canEdit = this.authState.hasPermission('MENU_REPORT_EDIT');

  reports = signal<MenuReportResponse[]>([]);

  selectedReport = signal<MenuReportResponse | null>(null);

  loading = signal(false);

  editLoading = signal(false);

  informationLoading = signal(false);

  cooksLoading = signal(false);

  isEditMode = signal(false);

  pageSize = signal(5);

  page = signal(0);

  totalPages = signal(0);

  totalElements = signal(0);

  startDate = signal('');

  endDate = signal('');

  dishMenus = signal<DishMenuResponse[]>([]);
  allCooks = signal<UserResponse[]>([]);
  selectedCooks = signal<UserResponse[]>([]);

  private loadEditData(report: MenuReportResponse): void {
    this.informationLoading.set(true);
    this.editLoading.set(true);

    this.menuReportService
      .getDishMenus()
      .pipe(
        finalize(() => {
          this.informationLoading.set(false);
          this.editLoading.set(false);
        }),
      )
      .subscribe({
        next: (dishMenus) => {
          this.dishMenus.set(dishMenus);

          this.editForm.dishMenuId.set(report.dishId);
          this.editForm.quantityPrepared.set(report.quantityPrepared);

          const selected = this.getReportCooks(report);

          this.selectedCooks.set(selected);
        },
        error: () => {
          this.toastService.show('Error al cargar datos para edición', 'danger');
        },
      });
  }

  private loadCooks(): void {
    if (this.allCooks().length > 0 || this.cooksLoading()) return;

    this.cooksLoading.set(true);

    this.userService
      .listActiveUsers()
      .pipe(
        finalize(() => {
          this.cooksLoading.set(false);
        }),
      )
      .subscribe({
        next: (cooks) => {
          this.allCooks.set(cooks);
        },
        error: () => {
          this.toastService.show('No se pudo cargar la lista de responsables', 'danger');
        },
      });
  }

  // Formulario de edición
  editForm = {
    dishMenuId: signal<number | null>(null),
    quantityPrepared: signal<number | null>(null),
    cooks: signal<number[]>([]),
  };

  constructor() {
    if (!this.canList) return;

    this.loadReports();

    this.loadCooks();
  }

  loadReports(): void {
    this.loading.set(true);

    this.menuReportService
      .list(
        this.page(),
        this.pageSize(),
        this.startDate() || undefined,
        this.endDate() || undefined,
      )
      .pipe(
        finalize(() => {
          this.loading.set(false);
        }),
      )
      .subscribe({
        next: (response) => {
          this.reports.set(response.content);

          this.totalPages.set(response.totalPages);

          this.totalElements.set(response.totalElements);
        },

        error: () => {
          this.reports.set([]);
        },
      });
  }

  search(): void {
    this.page.set(0);

    this.loadReports();
  }

  clearFilters(): void {
    this.startDate.set('');
    this.endDate.set('');

    this.page.set(0);

    this.search();
  }

  nextPage(): void {
    if (this.page() + 1 < this.totalPages()) {
      this.page.update((v) => v + 1);

      this.loadReports();
    }
  }

  previousPage(): void {
    if (this.page() > 0) {
      this.page.update((v) => v - 1);

      this.loadReports();
    }
  }
  cookDisplay = (cook: any) => `${cook.name} ${cook.lastname}`;

  addCook(cook: any): void {
    const exists = this.selectedCooks().some((c) => c.user_id === cook.user_id);
    if (exists) return;

    this.selectedCooks.update((list) => [...list, cook]);
  }

  removeCook(cook: any): void {
    this.selectedCooks.update((list) => list.filter((c) => c.user_id !== cook.user_id));
  }

  changePageSize(size: number): void {
    this.pageSize.set(size);

    this.page.set(0);

    this.loadReports();
  }

  openDetail(report: MenuReportResponse): void {
    this.selectedReport.set(report);
    this.isEditMode.set(false);
    this.resetForm();
  }

  mapearDia(day: string): string {
    switch (day) {
      case 'SUNDAY':
        return 'Domingo';
      case 'MONDAY':
        return 'Lunes';
      case 'TUESDAY':
        return 'Martes';
      case 'WEDNESDAY':
        return 'Miércoles';
      case 'THURSDAY':
        return 'Jueves';
      case 'FRIDAY':
        return 'Viernes';
      case 'SATURDAY':
        return 'Sábado';
      default:
        return day;
    }
  }

  goToCreate(): void {
    this.router.navigate(['/menu-report']);
  }

  createSameOrder(report: MenuReportResponse): void {
    if (!report) return;
    const modalElement = document.getElementById('purchaseDetailModal');

    const modal = bootstrap.Modal.getInstance(modalElement);

    modal?.hide();

    this.menuReportState.setDuplicateSource(report);

    this.router.navigate(['/menu-report']);
  }

  editarOrden(): void {
    const report = this.selectedReport();

    if (!report) return;

    this.isEditMode.set(true);

    this.loadEditData(report);
  }

  cancelEdit(): void {
    this.isEditMode.set(false);
    this.resetForm();
  }

  availableCooks = computed(() => {
    const selectedIds = new Set(this.selectedCooks().map((c) => c.user_id));

    return this.allCooks().filter((cook) => !selectedIds.has(cook.user_id));
  });

  saveEdit(): void {
    const report = this.selectedReport();
    if (!report) return;

    this.editLoading.set(true);

    const request: EditMenuReportRequest = {
      dishMenuId: this.editForm.dishMenuId() ?? report.dishId,
      quantityPrepared: this.editForm.quantityPrepared() ?? report.quantityPrepared,
      cooks: this.selectedCooks().map((c) => c.user_id),
    };

    this.menuReportService
      .editMenuReport(report.id, request)
      .pipe(finalize(() => this.editLoading.set(false)))
      .subscribe({
        next: (updated) => {
          this.toastService.show('Orden actualizada correctamente', 'success');

          this.selectedReport.set(updated);
          this.isEditMode.set(false);
          this.resetForm();
          this.loadReports();
        },

        error: (error) => {
          const msg = error.error?.message || 'Error al actualizar la orden';

          if (msg.includes('beneficiarios') || msg.includes('No se puede editar')) {
            this.toastService.show(
              'No se puede editar: la orden ya tiene beneficiarios asociados',
              'warning',
            );
          } else {
            this.toastService.show(msg, 'danger');
          }

          this.isEditMode.set(false);
          this.resetForm();
        },
      });
  }

  resetForm(): void {
    this.editForm.dishMenuId.set(null);
    this.editForm.quantityPrepared.set(null);

    this.selectedCooks.set([]);

    //this.allCooks.set([]);
    this.dishMenus.set([]);
  }

  goToOutOrder(report: MenuReportResponse): void {
    this.menuReportState.setSelectedReport(report);

    this.router.navigate(['/beneficiaries-control', 'manage', report.id]);
  }

  getReportCooks(report: MenuReportResponse): UserResponse[] {
    const cookIds = new Set(report.cooks ?? []);

    return this.allCooks().filter((cook) => cookIds.has(cook.user_id));
  }
}
