import { Component, computed, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { BeneficiaryApiService } from '@features/beneficiaries/services/beneficiary-api.service';
import { BeneficiaryStateService } from '@features/beneficiaries/services/beneficiary-state.service';
import { AuthStateService } from '@core/auth/services/auth-state.service';
import { BeneficiaryDetailModalComponent } from '../beneficiary-detail-modal/beneficiary-detail-modal.component';

declare const bootstrap: any;

@Component({
  selector: 'app-beneficiary-list-fragment',
  standalone: true,
  imports: [CommonModule, FormsModule, BeneficiaryDetailModalComponent],
  templateUrl: './beneficiary-list-fragment.component.html',
})
export class BeneficiaryListFragmentComponent {
  private readonly beneficiaryService = inject(BeneficiaryApiService);
  private readonly beneficiaryState = inject(BeneficiaryStateService);
  readonly authState = inject(AuthStateService);

  search = signal('');
  onlyActive = signal(false);
  currentPage = signal(1);
  readonly pageSize = 10;

  loading = signal<boolean>(true);

  readonly beneficiaries = this.beneficiaryState.beneficiaries;

  readonly filteredBeneficiaries = computed(() => {
    let list = this.beneficiaries();

    if (this.onlyActive()) {
      list = list.filter((b) => b.status === 'ACTIVO');
    }

    list = list.filter((b) => {
      const term = this.search().toLowerCase();
      return (
        b.name.toLowerCase().includes(term) ||
        b.lastname.toLowerCase().includes(term) ||
        b.dni.includes(term)
      );
    });

    list = [...list].sort((a, b) =>
      `${a.name} ${a.lastname}`.localeCompare(`${b.name} ${b.lastname}`)
    );

    return list;
  });

  readonly totalPages = computed(() =>
    Math.ceil(this.filteredBeneficiaries().length / this.pageSize)
  );

  readonly pagedBeneficiaries = computed(() => {
    const start = (this.currentPage() - 1) * this.pageSize;
    return this.filteredBeneficiaries().slice(start, start + this.pageSize);
  });

  readonly pages = computed(() =>
    Array.from({ length: this.totalPages() }, (_, i) => i + 1)
  );

  constructor() {
    this.loadBeneficiaries();
  }

  loadBeneficiaries(): void {
    this.loading.set(true);

    this.beneficiaryService.listByStatus().subscribe({
      next: (list) => {
        this.beneficiaryState.setBeneficiaries(list);
        this.currentPage.set(1);
        this.loading.set(false);
      },
      error: (err) => {
        console.error('Error cargando beneficiarios', err);
        this.loading.set(false);
      }
    });
  }

  goToPage(page: number): void {
    if (page >= 1 && page <= this.totalPages()) {
      this.currentPage.set(page);
    }
  }

  openBeneficiary(beneficiary: any): void {
    this.beneficiaryState.selectBeneficiary(beneficiary);
    const modal = new bootstrap.Modal(document.getElementById('beneficiaryDetailModal'));
    modal.show();
  }
}