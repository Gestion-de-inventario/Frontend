import { Component, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { finalize } from 'rxjs/operators';
import { PurchaseApiService } from '../../services/purchase-api.service';
import { PurchaseResponse } from '../../interfaces/purchase.response';
import { Router } from '@angular/router';
import { AuthStateService } from '@core/auth/services/auth-state.service';

@Component({
  selector: 'app-list-purchase-fragment',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './list-purchase-fragment.component.html',
})
export class ListPurchaseFragmentComponent {
  private readonly purchaseService = inject(PurchaseApiService);
  private readonly router = inject(Router);

  readonly authState = inject(AuthStateService);

  canList = this.authState.hasPermission('PURCHASE_LIST_ALL');
  canCreate = this.authState.hasPermission('PURCHASE_CREATE');

  purchases = signal<PurchaseResponse[]>([]);

  loading = signal(false);

  pageSize = signal(5);

  page = signal(0);

  totalPages = signal(0);

  totalElements = signal(0);

  startDate = signal('');

  endDate = signal('');

  status = signal('');

  clearFilters(): void {
    this.startDate.set('');
    this.endDate.set('');
    this.status.set('');

    this.page.set(0);

    this.search();
  }

  constructor() {
    if (!this.canList) return;

    this.loadPurchases();
  }

  loadPurchases(): void {
    this.purchaseService
      .list(
        this.page(),
        this.pageSize(),
        this.startDate() || undefined,
        this.endDate() || undefined,
        this.status() || undefined,
      )
      .pipe(
        finalize(() => {
          this.loading.set(false);
        }),
      )
      .subscribe({
        next: (response) => {
          this.purchases.set(response.content);

          this.totalPages.set(response.totalPages);

          this.totalElements.set(response.totalElements);
        },

        error: () => {
          this.purchases.set([]);
        },
      });
  }

  search(): void {
    this.page.set(0);

    this.loadPurchases();
  }

  nextPage(): void {
    if (this.page() + 1 < this.totalPages()) {
      this.loading.set(true);
      this.page.update((v) => v + 1);

      this.loadPurchases();
    }
  }

  previousPage(): void {
    if (this.page() > 0) {
      this.loading.set(true);
      this.page.update((v) => v - 1);
      this.loadPurchases();
    }
  }

  goToCreate(): void {
    this.router.navigate(['/purchase-order/create']);
  }

  changePageSize(size: number): void {
    this.loading.set(true);
    this.pageSize.set(size);

    this.page.set(0);

    this.loadPurchases();
  }
}
