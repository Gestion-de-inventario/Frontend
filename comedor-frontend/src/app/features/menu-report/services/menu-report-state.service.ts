import { Injectable, signal } from '@angular/core';
import { MenuReportDetailResponse } from '../interfaces/menu-report.response';
import { TemplateIngredient } from '../menu-report-templates';

@Injectable({
  providedIn: 'root',
})
export class MenuReportStateService {
  private readonly _report = signal<MenuReportDetailResponse | null>(null);
  readonly report = this._report.asReadonly();

  private readonly _pendingTemplateItems = signal<TemplateIngredient[]>([]);
  readonly pendingTemplateItems = this._pendingTemplateItems.asReadonly();

  setReport(report: MenuReportDetailResponse): void {
    this._report.set(report);
  }

  clearReport(): void {
    this._report.set(null);
  }

  updateReport(report: MenuReportDetailResponse): void {
    this._report.set(report);
  }

  setPendingTemplateItems(items: TemplateIngredient[]): void {
    this._pendingTemplateItems.set(items);
  }

  clearPendingTemplateItems(): void {
    this._pendingTemplateItems.set([]);
  }
}