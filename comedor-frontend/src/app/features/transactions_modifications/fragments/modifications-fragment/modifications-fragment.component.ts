import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ModificationsService } from '@features/transactions_modifications/services/modification/modifications-api.service';
import { ModificationsResponse } from '@features/transactions_modifications/interfaces/modifications/modifications.response';

declare const bootstrap: any;

@Component({
  selector: 'app-modifications-fragment',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './modifications-fragment.component.html',
})
export class ModificationsFragmentComponent {
  private readonly modificationsService = inject(ModificationsService);

  modificationsPreview: ModificationsResponse[] = [];
  modalModifications: ModificationsResponse[] = [];

  loading = false;

  page = 0;
  size = 10;

  constructor() {
    this.loadPreview();
  }

  loadPreview(): void {
    this.modificationsService.list(0, 5).subscribe({
      next: (data) => (this.modificationsPreview = data.content ?? data),
    });
  }

  openModal(): void {
    this.page = 0;
    this.modalModifications = [];

    this.loadPage();

    const modal = new bootstrap.Modal(document.getElementById('modificationsModal'));
    modal.show();
  }

  loadPage(): void {
    this.loading = true;

    this.modificationsService.list(this.page, this.size).subscribe({
      next: (data: any) => {
        this.modalModifications = [...this.modalModifications, ...(data.content ?? data)];
      },
      complete: () => {
        this.loading = false;
      },
    });
  }

  nextPage(): void {
    if (this.loading) return;

    this.page++;
    this.loadPage();
  }
}
