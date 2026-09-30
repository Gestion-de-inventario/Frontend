import {
  Component,
  Input,
  Output,
  EventEmitter,
  signal,
  computed,
  ElementRef,
  inject,
  HostListener,
  ContentChild,
  TemplateRef,
} from '@angular/core';

import { NgTemplateOutlet } from '@angular/common';

@Component({
  selector: 'app-search-select',
  imports: [NgTemplateOutlet],
  templateUrl: './search-select.html',
  styleUrl: './search-select.scss',
})
export class SearchSelectComponent<T> {
  private readonly elementRef = inject(ElementRef);

  @Input({ required: true }) items: T[] = [];

  @Input({ required: true }) displayFn!: (item: T) => string;

  @Input() placeholder = 'Buscar...';

  @ContentChild(TemplateRef)
  itemTemplate?: TemplateRef<any>;

  @Output() selected = new EventEmitter<T>();

  search = signal('');
  open = signal(false);

  get filteredItems(): T[] {
    const term = this.normalize(this.search().trim());

    if (!term) {
      return this.items.slice(0, 6);
    }

    return this.items
      .filter((item) => this.normalize(this.displayFn(item)).includes(term))
      .slice(0, 10);
  }

  @HostListener('document:click', ['$event'])
  onDocumentClick(event: MouseEvent): void {
    if (!this.elementRef.nativeElement.contains(event.target)) {
      this.open.set(false);
    }
  }

  select(item: T): void {
    this.selected.emit(item);
    this.search.set('');
    this.open.set(false);
  }

  private normalize(value: string): string {
    return value
      .toLocaleLowerCase('es')
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '');
  }
}
