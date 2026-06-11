import { Component, computed, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AuthStateService } from '@core/auth/services/auth-state.service';
import { ToastService } from '@shared/services/toast.service';
import { TagApiService } from '@features/categoriesandtags/services/tag-api.service';
import { TagStateService } from '@features/categoriesandtags/services/tag-state.service';

@Component({
  selector: 'app-tag-detail-modal',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './tag-detail-modal.component.html',
})
export class TagDetailModalComponent {
  readonly authState = inject(AuthStateService);
  private readonly tagState = inject(TagStateService);
  private readonly tagService = inject(TagApiService);
  private readonly toastService = inject(ToastService);

  readonly tag = computed(() => this.tagState.selectedTag());

  loading = signal<boolean>(false);

  changeStatus(status: string): void {
    const tag = this.tag();
    if (!tag || this.loading()) return;

    this.loading.set(true);

    this.tagService.changeStatus(tag.id, status).subscribe({
      next: (updated) => {
        this.tagState.updateTag(updated);
        this.toastService.show(
          status === 'ACTIVO' ? 'Etiqueta activada' : 'Etiqueta desactivada',
          status === 'ACTIVO' ? 'success' : 'warning',
        );
      },
      error: (error) => {
        this.toastService.show('No se pudo cambiar el estado: ' + error.error.message, 'danger');
        this.loading.set(false);
      },
      complete: () => {
        this.loading.set(false);
      },
    });
  }

  close(): void {
    this.tagState.clearSelectedTag();
  }
}
