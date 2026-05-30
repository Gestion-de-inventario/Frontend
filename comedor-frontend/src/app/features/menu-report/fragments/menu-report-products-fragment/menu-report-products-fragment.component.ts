import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MenuReportStateService } from '@features/menu-report/services/menu-report-state.service';

@Component({
  selector: 'app-menu-report-products-fragment',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './menu-report-products-fragment.component.html',
})
export class MenuReportProductsFragmentComponent {
  private readonly menuReportState = inject(MenuReportStateService);
  readonly report = this.menuReportState.report;

  // Ya no necesitamos métodos de edición/eliminación porque el backend 
  // gestiona los movimientos de stock automáticamente al crear el plato.
}