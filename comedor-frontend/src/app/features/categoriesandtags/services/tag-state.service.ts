import { Injectable, signal } from '@angular/core';
import { TagResponse } from '../interfaces/tag.response';

@Injectable({
  providedIn: 'root',
})
export class TagStateService {
  private readonly _tags = signal<TagResponse[]>([]);
  readonly tags = this._tags.asReadonly();

  private readonly _selectedTag = signal<TagResponse | null>(null);
  readonly selectedTag = this._selectedTag.asReadonly();

  setTags(tags: TagResponse[]): void {
    this._tags.set(tags);
  }

  selectTag(tag: TagResponse): void {
    this._selectedTag.set(tag);
  }

  clearSelectedTag(): void {
    this._selectedTag.set(null);
  }

  addTag(tag: TagResponse): void {
    this._tags.update((list) => [tag, ...list]);
  }

  updateTag(updated: TagResponse): void {
    this._tags.update((list) =>
      list.map((t) => (t.id === updated.id ? updated : t))
    );
    const selected = this._selectedTag();
    if (selected && selected.id === updated.id) {
      this._selectedTag.set(updated);
    }
  }
}