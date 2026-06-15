import { Component, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { finalize } from 'rxjs/operators';

import { Router } from '@angular/router';

import { MenuReportApiService } from '../../services/menu-report-api.service';

import { MenuReportResponse } from '../../interfaces/menu-report.response';

import { AuthStateService } from '@core/auth/services/auth-state.service';

@Component({
  selector: 'app-list-menu-report-fragment',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './list-menu-report-fragment.component.html',
  styleUrls: ['./list-menu-report-fragment.component.scss'],
})
export class ListMenuReportFragmentComponent {
  private readonly menuReportService = inject(MenuReportApiService);

  private readonly router = inject(Router);

  readonly authState = inject(AuthStateService);

  canList = this.authState.hasPermission('MENU_REPORT_LIST_ALL');

  canCreate = this.authState.hasPermission('MENU_REPORT_CREATE_REPORT');

  canEdit = this.authState.hasPermission('MENU_REPORT_EDIT');

  reports = signal<MenuReportResponse[]>([]);

  selectedReport = signal<MenuReportResponse | null>(null);

  loading = signal(false);

  editLoading = signal(false);

  pageSize = signal(1);

  page = signal(0);

  totalPages = signal(0);

  totalElements = signal(0);

  startDate = signal('');

  endDate = signal('');

  constructor() {
    if (!this.canList) return;

    this.loadReports();
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

  changePageSize(size: number): void {
    this.pageSize.set(size);

    this.page.set(0);

    this.loadReports();
  }

  openDetail(report: MenuReportResponse): void {
    this.selectedReport.set(report);
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
  createSameOrder() {}

  editarOrden() {
    //proximamente
  }
}
