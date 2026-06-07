import { computed, Injectable, signal } from '@angular/core';
import { beneficiaryTypeResponse } from '@features/beneficiaryType/interfaces/beneficiaryType.response';

@Injectable({
  providedIn: 'root',
})
export class BeneficiaryTypeStateService {
  private readonly _types = signal<beneficiaryTypeResponse[]>([]);

  readonly types = this._types.asReadonly();

  readonly selectedType = signal<beneficiaryTypeResponse | null>(null);

  readonly search = signal('');

  readonly statusFilter = signal('TODOS');

  readonly filteredTypes = computed(() => {
    let data = this.types();

    const search = this.search().toLowerCase();

    if (search) {
      data = data.filter(
        (x) => x.name.toLowerCase().includes(search) || x.desc.toLowerCase().includes(search),
      );
    }

    if (this.statusFilter() !== 'TODOS') {
      data = data.filter((x) => x.status === this.statusFilter());
    }

    return data;
  });

  setTypes(types: beneficiaryTypeResponse[]): void {
    this._types.set(types);
  }

  setSelectedType(type: beneficiaryTypeResponse): void {
    this.selectedType.set(type);
  }

  clear(): void {
    this._types.set([]);
  }

  clearSelectedType(): void {
    this.selectedType.set(null);
  }

  setSearch(value: string): void {
    this.search.set(value);
  }

  setStatusFilter(value: string): void {
    this.statusFilter.set(value);
  }

  findById(id: number): beneficiaryTypeResponse | undefined {
    return this._types().find((t) => t.id === id);
  }

  updateType(updated: beneficiaryTypeResponse): void {
    this._types.update((types) => types.map((type) => (type.id === updated.id ? updated : type)));

    if (this.selectedType()?.id === updated.id) {
      this.selectedType.set(updated);
    }
  }

  addType(type: beneficiaryTypeResponse): void {
    this._types.update((current) => [...current, type]);
  }
}
