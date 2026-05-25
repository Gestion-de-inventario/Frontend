import { Component, computed, inject, ChangeDetectorRef, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ModificationsService } from '@features/transactions_modifications/services/modification/modifications-api.service';
import { ModificationsStateService } from '@features/transactions_modifications/services/modification/modifications-state.service';
import { ModificationsResponse } from '@features/transactions_modifications/interfaces/modifications/modifications.response';

declare const bootstrap: any;

@Component({
  selector: 'app-modifications-fragment',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './modifications-fragment.component.html',
})
export class ModificationsFragmentComponent implements OnInit {
  private readonly modificationsService = inject(ModificationsService);
  private readonly modificationsState = inject(ModificationsStateService);
  private readonly cdr = inject(ChangeDetectorRef); // 2. Inyectamos el detector

  readonly modifications = computed(() => this.modificationsState.modifications());
  modalModifications: ModificationsResponse[] = [];
  loading = false;
  modalPage = 0;
  modalSize = 10;

  ngOnInit(): void {
    this.loadPreview();
  }

  loadPreview(): void {
    this.loading = true;
    this.modificationsService.list(0, 3).subscribe({
      next: (data) => {
        this.modificationsState.set(data.content);
        this.loading = false;
        this.cdr.detectChanges();
      },
      error: () => {
        this.loading = false;
        this.cdr.detectChanges();
      },
    });
  }

  openModal(): void {
    this.modalPage = 0;
    this.modalModifications = [];
    this.loadPage();

    const modalElement = document.getElementById('modificationsModal');
    if (modalElement) {
      const modal = new bootstrap.Modal(modalElement);
      modal.show();
    }
  }
  closeModal(): void {
    this.loading = false;
    this.modalModifications = [];
    this.modalPage = 0;
  }

  loadPage(): void {
    if (this.modalPage === 0) this.loading = true;

    this.modificationsService.list(this.modalPage, this.modalSize).subscribe({
      next: (data: any) => {
        const content = data.content ?? data;
        this.modalModifications = [...this.modalModifications, ...content];
        this.loading = false;
        this.cdr.detectChanges();
      },
      error: () => {
        this.loading = false;
        this.cdr.detectChanges();
      },
    });
  }

  nextPage(): void {
    if (this.loading) return;
    this.modalPage++;
    this.loading = true;
    this.loadPage();
  }
}
