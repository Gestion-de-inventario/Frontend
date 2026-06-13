import { Component, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { finalize } from 'rxjs/operators';
import { PurchaseApiService } from '../../services/purchase-api.service';
import { PurchaseResponse } from '../../interfaces/purchase.response';
import { Router } from '@angular/router';
import { AuthStateService } from '@core/auth/services/auth-state.service';
import { ToastService } from '@shared/services/toast.service';
import { PurchaseOrderStateService } from '@features/purchase-order/services/purchase-state.service';
declare const bootstrap: any;
@Component({
  selector: 'app-list-purchase-fragment',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './list-purchase-fragment.component.html',
  styleUrls: ['./list-purchase-fragment.component.scss'],
})
export class ListPurchaseFragmentComponent {
  private readonly purchaseService = inject(PurchaseApiService);
  private readonly purchaseOrderState = inject(PurchaseOrderStateService);

  private readonly router = inject(Router);

  readonly authState = inject(AuthStateService);

  readonly toastService = inject(ToastService);

  canList = this.authState.hasPermission('PURCHASE_LIST_ALL');
  canCreate = this.authState.hasPermission('PURCHASE_CREATE');
  canChangeStatus = this.authState.hasPermission('PURCHASE_CHANGE_STATUS');

  purchases = signal<PurchaseResponse[]>([]);

  selectedPurchase = signal<PurchaseResponse | null>(null);

  changeStatusLoading = signal(false);

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
    this.loading.set(true);
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

  openDetail(purchase: PurchaseResponse): void {
    this.selectedPurchase.set(purchase);
  }

  confirmPurchase(id: number): void {
    this.changeStatusLoading.set(true);

    this.purchaseService.confirmPurchase(id).subscribe({
      next: (updatedPurchase) => {
        this.selectedPurchase.set(updatedPurchase);

        this.purchases.update((purchases) =>
          purchases.map((p) => (p.id === updatedPurchase.id ? updatedPurchase : p)),
        );

        this.toastService.show('Orden marcada como recibida', 'success');
      },

      error: (error) => {
        this.toastService.show(error.error.message, 'danger');
        this.changeStatusLoading.set(false);
      },

      complete: () => {
        this.changeStatusLoading.set(false);
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
      this.page.update((v) => v - 1);
      this.loadPurchases();
    }
  }

  goToCreate(): void {
    this.router.navigate(['/purchase-order/create']);
  }

  changePageSize(size: number): void {
    this.pageSize.set(size);

    this.page.set(0);

    this.loadPurchases();
  }

  createSameOrder(): void {
    const purchase = this.selectedPurchase();

    if (!purchase) {
      return;
    }

    this.purchaseOrderState.setDraftPurchase(
      purchase.details.map((detail) => ({
        productId: detail.productId,
        productName: detail.productName,
        productUnit: detail.productUnit,
        quantity: detail.quantity,
        unitPrice: detail.unitPrice,
        search: '',
      })),
    );
    const modalElement = document.getElementById('purchaseDetailModal');

    const modal = bootstrap.Modal.getInstance(modalElement);

    modal?.hide();
    this.router.navigate(['/purchase-order/create']);
  }
}
