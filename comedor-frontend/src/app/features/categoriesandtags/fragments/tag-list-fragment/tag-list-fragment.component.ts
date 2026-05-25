import { Component, computed, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { TagApiService } from '@features/categoriesandtags/services/tag-api.service';
import { TagStateService } from '@features/categoriesandtags/services/tag-state.service';
import { TagDetailModalComponent } from '../tag-detail-modal/tag-detail-modal.component';

declare const bootstrap: any;

@Component({
  selector: 'app-tag-list-fragment',
  standalone: true,
  imports: [CommonModule, FormsModule, TagDetailModalComponent],
  templateUrl: './tag-list-fragment.component.html',
})
export class TagListFragmentComponent {
  private readonly tagService = inject(TagApiService);
  private readonly tagState = inject(TagStateService);

  search = signal('');
  onlyActive = signal(false);

  readonly tags = this.tagState.tags;

  readonly filteredTags = computed(() => {
    let list = this.tags();

    if (this.onlyActive()) {
      list = list.filter((t) => t.status === 'ACTIVO');
    }

    return list.filter((t) =>
      t.name.toLowerCase().includes(this.search().toLowerCase())
    );
  });

  constructor() {
    this.loadTags();
  }

  loadTags(): void {
    this.tagService.listByStatus().subscribe((list) => {
      this.tagState.setTags(list);
    });
  }

  openTag(tag: any): void {
    this.tagState.selectTag(tag);
    const modal = new bootstrap.Modal(document.getElementById('tagDetailModal'));
    modal.show();
  }
}