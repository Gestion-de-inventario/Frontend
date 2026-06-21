import { Component, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { finalize } from 'rxjs/operators';
import { PurchaseApiService } from '../../services/purchase-api.service';
import { PurchaseResponse } from '../../interfaces/purchase/purchase.response';
import { Router } from '@angular/router';
import { AuthStateService } from '@core/auth/services/auth-state.service';
import { ToastService } from '@shared/services/toast.service';
import { InventoryOrderStateService } from '@features/order-in/services/inventary-order-state.service';
import { OrderSource } from '@features/order-in/interfaces/order.source';
import { DonationApiService } from '@features/order-in/services/donation-api.service';
import { DonationResponse } from '@features/order-in/interfaces/donation/donation.response';
import { OrderInListItem } from '@features/order-in/interfaces/order-in/order-in-item';
import { OrderInApiService } from '@features/order-in/services/order-in-api.service';
declare const bootstrap: any;

type OrderFilter = 'TODOS' | 'COMPRA' | 'DONACION';

@Component({
  selector: 'app-list-purchase-fragment',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './list-purchase-fragment.component.html',
  styleUrls: ['./list-purchase-fragment.component.scss'],
})
export class ListPurchaseFragmentComponent {
  private readonly purchaseService = inject(PurchaseApiService);
  private readonly donationService = inject(DonationApiService);
  private readonly orderInService = inject(OrderInApiService);
  private readonly inventoryOrderState = inject(InventoryOrderStateService);

  private readonly router = inject(Router);

  readonly authState = inject(AuthStateService);

  readonly toastService = inject(ToastService);

  canListPurchases = this.authState.hasPermission('PURCHASE_LIST_ALL');
  canChangeStatusOfPurchases = this.authState.hasPermission('PURCHASE_CHANGE_STATUS');
  canListDonations = this.authState.hasPermission('DONATION_LIST_ALL');
  canChangeStatusOfDonations = this.authState.hasPermission('DONATION_CHANGE_STATUS');

  canListOrdersIn = this.authState.hasPermission('ORDER_IN_LIST_ALL');

  canCreate = this.authState.hasPermission('CREATE_ORDER_IN');

  orders = signal<OrderInListItem[]>([]);
  selectedOrder = signal<OrderInListItem | null>(null);
  orderType = this.inventoryOrderState.orderType;

  detailLoading = signal<boolean>(false);
  changeStatusLoading = signal(false);
  loading = signal(false);

  pageSize = signal(5);
  page = signal(0);
  totalPages = signal(0);
  totalElements = signal(0);
  startDate = signal('');
  endDate = signal('');
  status = signal('');

  orderFilter = signal<OrderFilter>('TODOS');

  constructor() {
    this.setInitialFilter();
    this.loadOrders();
  }

  private setInitialFilter(): void {
    if (this.canListOrdersIn) {
      this.orderFilter.set('TODOS');
      return;
    }

    if (this.canListPurchases) {
      this.orderFilter.set('COMPRA');
      return;
    }

    if (this.canListDonations) {
      this.orderFilter.set('DONACION');
      return;
    }
  }
  get canChangeSelectedOrderStatus(): boolean {
    const order = this.selectedOrder();

    if (!order) return false;

    if (order.source === 'COMPRA') {
      return this.canChangeStatusOfPurchases;
    }

    if (order.source === 'DONACION') {
      return this.canChangeStatusOfDonations;
    }

    return false;
  }

  get orderFilterLabel(): string {
    if (this.orderFilter() === 'TODOS') return 'órdenes de entrada';
    if (this.orderFilter() === 'COMPRA') return 'órdenes de compra';
    return 'órdenes de donación';
  }

  get canListCurrentFilter(): boolean {
    if (this.orderFilter() === 'TODOS') return this.canListOrdersIn;
    if (this.orderFilter() === 'COMPRA') return this.canListPurchases;
    if (this.orderFilter() === 'DONACION') return this.canListDonations;

    return false;
  }

  changeOrderType(type: OrderFilter): void {
    this.orderFilter.set(type);
    this.page.set(0);
    this.loadOrders();
  }

  loadOrders(): void {
    if (!this.canListCurrentFilter) {
      this.orders.set([]);
      return;
    }

    if (this.orderFilter() === 'TODOS') {
      this.loadAllOrders();
      return;
    }

    if (this.orderFilter() === 'COMPRA') {
      this.loadPurchases();
      return;
    }

    this.loadDonations();
  }

  private loadAllOrders(): void {
    this.loading.set(true);

    this.orderInService
      .list(
        this.page(),
        this.pageSize(),
        this.startDate() || undefined,
        this.endDate() || undefined,
        undefined,
        this.status() || undefined,
      )
      .pipe(
        finalize(() => {
          this.loading.set(false);
        }),
      )
      .subscribe({
        next: (response) => {
          this.orders.set(response.content as OrderInListItem[]);
          this.totalPages.set(response.totalPages);
          this.totalElements.set(response.totalElements);
          this.page.set(response.number);
        },
        error: () => {
          this.orders.set([]);
          this.toastService.show('Error al cargar órdenes de entrada', 'danger');
        },
      });
  }

  private loadPurchases(): void {
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
          this.orders.set(response.content.map((p) => this.mapPurchaseToOrder(p)));

          this.totalPages.set(response.totalPages);
          this.totalElements.set(response.totalElements);
          this.page.set(response.number);
        },
        error: () => {
          this.orders.set([]);
          this.toastService.show('Error al cargar compras', 'danger');
        },
      });
  }

  private loadDonations(): void {
    this.loading.set(true);

    this.donationService
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
          this.orders.set(response.content.map((d) => this.mapDonationToOrder(d)));

          this.totalPages.set(response.totalPages);
          this.totalElements.set(response.totalElements);
          this.page.set(response.number);
        },
        error: () => {
          this.orders.set([]);
          this.toastService.show('Error al cargar donaciones', 'danger');
        },
      });
  }

  openDetail(order: OrderInListItem): void {
    this.selectedOrder.set(order);

    // Si NO estamos en TODOS, ya vino con detalles.
    if (this.orderFilter() !== 'TODOS') {
      return;
    }

    this.detailLoading.set(true);

    if (order.source === 'COMPRA') {
      this.purchaseService
        .getById(order.id)
        .pipe(finalize(() => this.detailLoading.set(false)))
        .subscribe({
          next: (purchase) => {
            this.selectedOrder.set(this.mapPurchaseToOrder(purchase));
          },
          error: () => {
            this.toastService.show('No se pudo cargar el detalle de la compra', 'danger');
          },
        });

      return;
    }

    this.donationService
      .getById(order.id)
      .pipe(finalize(() => this.detailLoading.set(false)))
      .subscribe({
        next: (donation) => {
          this.selectedOrder.set(this.mapDonationToOrder(donation));
        },
        error: () => {
          this.toastService.show('No se pudo cargar el detalle de la donación', 'danger');
        },
      });
  }

  confirmOrder(): void {
    const order = this.selectedOrder();

    if (!order || this.changeStatusLoading()) return;

    if (order.source === 'COMPRA' && !this.canChangeStatusOfPurchases) return;
    if (order.source === 'DONACION' && !this.canChangeStatusOfDonations) return;

    this.changeStatusLoading.set(true);

    if (order.source === 'COMPRA') {
      this.purchaseService
        .confirmPurchase(order.id)
        .pipe(finalize(() => this.changeStatusLoading.set(false)))
        .subscribe({
          next: (purchase) => {
            const updatedOrder = this.mapPurchaseToOrder(purchase);

            this.selectedOrder.set(updatedOrder);
            this.updateOrderInList(updatedOrder);

            this.toastService.show('Orden marcada como recibida', 'success');
          },
          error: (error) => {
            this.toastService.show(
              error.error?.message || 'No se pudo cambiar el estado',
              'danger',
            );
          },
        });

      return;
    }

    this.donationService
      .confirmDonation(order.id)
      .pipe(finalize(() => this.changeStatusLoading.set(false)))
      .subscribe({
        next: (donation) => {
          const updatedOrder = this.mapDonationToOrder(donation);

          this.selectedOrder.set(updatedOrder);
          this.updateOrderInList(updatedOrder);

          this.toastService.show('Orden marcada como recibida', 'success');
        },
        error: (error) => {
          this.toastService.show(error.error?.message || 'No se pudo cambiar el estado', 'danger');
        },
      });
  }

  private updateOrderInList(updatedOrder: OrderInListItem): void {
    this.orders.update((orders) =>
      orders.map((order) =>
        order.id === updatedOrder.id && order.source === updatedOrder.source ? updatedOrder : order,
      ),
    );
  }

  search(): void {
    this.page.set(0);

    this.loadOrders();
  }

  clearFilters(): void {
    this.startDate.set('');
    this.endDate.set('');
    this.status.set('');

    this.page.set(0);

    this.loadOrders();
  }

  nextPage(): void {
    if (this.page() + 1 < this.totalPages()) {
      this.loading.set(true);
      this.page.update((v) => v + 1);

      this.loadOrders();
    }
  }

  previousPage(): void {
    if (this.page() > 0) {
      this.page.update((v) => v - 1);
      this.loadOrders();
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
    const order = this.selectedOrder();

    if (!order || !order.details?.length) return;

    this.inventoryOrderState.setOrderType(order.source === 'COMPRA' ? 'COMPRA' : 'DONACION');

    this.inventoryOrderState.setDraftOrder(
      order.details.map((detail) => ({
        productId: detail.productId,
        productName: detail.productName,
        productUnit: detail.productUnit,
        quantity: detail.quantity,
        unitPrice: detail.unitPrice ?? 0,
        search: '',
      })),
    );

    const modalElement = document.getElementById('purchaseDetailModal');
    const modal = bootstrap.Modal.getInstance(modalElement);

    modal?.hide();

    this.router.navigate(['/purchase-order/create']);
  }

  private mapPurchaseToOrder(purchase: PurchaseResponse): OrderInListItem {
    return {
      reference: `COMPRA-${purchase.id}`,
      id: purchase.id,
      source: 'COMPRA',
      date: purchase.purchaseDate,
      status: purchase.status,
      totalSpent: purchase.totalSpent,
      details: purchase.details.map((detail) => ({
        productId: detail.productId,
        productName: detail.productName,
        productUnit: detail.productUnit,
        quantity: detail.quantity,
        unitPrice: detail.unitPrice,
        subTotal: detail.subTotal,
      })),
    };
  }

  private mapDonationToOrder(donation: DonationResponse): OrderInListItem {
    return {
      reference: `DONACION-${donation.id}`,
      id: donation.id,
      source: 'DONACION',
      date: donation.donationDate,
      status: donation.status,
      details: donation.details.map((detail) => ({
        productId: detail.productId,
        productName: detail.productName,
        productUnit: detail.productUnit,
        quantity: detail.quantity,
        unitPrice: 0,
        subTotal: 0,
      })),
    };
  }
}
