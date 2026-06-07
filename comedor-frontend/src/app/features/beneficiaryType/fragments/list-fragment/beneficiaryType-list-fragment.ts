import { CommonModule } from '@angular/common';
import { Component, computed, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { beneficiaryTypeResponse } from '@features/beneficiaryType/interfaces/beneficiaryType.response';
import { BeneficiaryTypeDetailModalComponent } from '@features/beneficiaryType/modals/beneficiaryType-detail-modal/beneficiary-type-detail-modal.component';
import { BeneficiaryTypeApiService } from '@features/beneficiaryType/services/beneficiaryType-api.service';
import { BeneficiaryTypeStateService } from '@features/beneficiaryType/services/beneficiaryType-state.service';

declare const bootstrap: any;

@Component({
  selector: 'app-beneficiary-type-list-fragment',
  standalone: true,
  imports: [CommonModule, FormsModule, BeneficiaryTypeDetailModalComponent],
  templateUrl: './beneficiary-type-list-fragment.component.html',
})
export class BeneficiaryTypeListFragmentComponent {
  private readonly service = inject(BeneficiaryTypeApiService);

  readonly state = inject(BeneficiaryTypeStateService);

  readonly types = computed(() => this.state.filteredTypes());

  readonly loading = signal(false);

  constructor() {
    this.loadTypes();
  }

  loadTypes(): void {
    this.loading.set(true);

    this.service.list().subscribe({
      next: (types) => {
        this.state.setTypes(types);
      },
      complete: () => {
        this.loading.set(false);
      },
    });
  }

  onSearch(event: Event): void {
    const value = (event.target as HTMLInputElement).value;

    this.state.setSearch(value);
  }

  onStatusChange(event: Event): void {
    const value = (event.target as HTMLSelectElement).value;

    this.state.setStatusFilter(value);
  }

  openType(type: beneficiaryTypeResponse): void {
    this.state.setSelectedType(type);

    const modal = new bootstrap.Modal(document.getElementById('beneficiaryTypeDetailModal'));

    modal.show();
  }
}
