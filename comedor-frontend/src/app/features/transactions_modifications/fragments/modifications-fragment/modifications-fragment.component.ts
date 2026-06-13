import { Component, computed, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ModificationsService } from '@features/transactions_modifications/services/modification/modifications-api.service';
import { ModificationsStateService } from '@features/transactions_modifications/services/modification/modifications-state.service';
import { ModificationsResponse } from '@features/transactions_modifications/interfaces/modifications/modifications.response';
import { AuthStateService } from '@core/auth/services/auth-state.service';
import { FormsModule } from '@angular/forms';

declare const bootstrap: any;

@Component({
  selector: 'app-modifications-fragment',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './modifications-fragment.component.html',
})
export class ModificationsFragmentComponent {
  readonly authState = inject(AuthStateService);
  private readonly modificationsService = inject(ModificationsService);
  private readonly modificationsState = inject(ModificationsStateService);

  canList = this.authState.hasPermission('MODIFICATION_LIST_ALL');
  readonly modifications = computed(() => this.modificationsState.modifications());
  modalModifications: ModificationsResponse[] = [];
  loading = signal<boolean>(false);
  modalPage = 0;
  modalSize = 10;

  pageSize = signal(3);

  page = signal(0);

  totalPages = signal(0);

  totalElements = signal(0);

  constructor() {
    if (!this.canList) return;

    this.loadModifications();
  }

  loadModifications(): void {
    this.loading.set(true);
    this.modificationsService.list(this.page(), this.pageSize()).subscribe({
      next: (response) => {
        this.modificationsState.set(response.content);

        this.totalPages.set(response.totalPages);

        this.totalElements.set(response.totalElements);

        this.loading.set(false);
      },
      error: () => {
        this.loading.set(false);
      },

      complete: () => {
        this.loading.set(false);
      },
    });
  }

  nextPage(): void {
    if (this.page() + 1 < this.totalPages()) {
      this.page.update((v) => v + 1);

      this.loadModifications();
    }
  }

  previousPage(): void {
    if (this.page() > 0) {
      this.page.update((v) => v - 1);

      this.loadModifications();
    }
  }

  changePageSize(size: number): void {
    this.pageSize.set(size);

    this.page.set(0);

    this.loadModifications();
  }
}
