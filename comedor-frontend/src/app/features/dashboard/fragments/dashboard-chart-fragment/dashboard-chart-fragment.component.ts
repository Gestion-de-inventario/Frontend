import { Component, computed, inject } from '@angular/core';
import { DashboardStateService } from '../../services/dashboard-state.service';
import { DecimalPipe } from '@angular/common';

@Component({
  selector: 'app-dashboard-chart-fragment',
  standalone: true,
  imports: [DecimalPipe],
  templateUrl: './dashboard-chart-fragment.component.html',
  styleUrl: './dashboard-chart-fragment.component.scss'
})
export class DashboardChartFragmentComponent {
  readonly state = inject(DashboardStateService);
  
  // Extraemos la lista de productos
  readonly topProductos = computed(() => this.state.dashboardData()?.topProductos || []);

  // Calculamos cuál es el valor máximo para que esa barra sea el 100% de ancho
  readonly maxMovement = computed(() => {
    const products = this.topProductos();
    if (products.length === 0) return 1;
    return Math.max(...products.map(p => p.totalMovido));
  });

  // Función que devuelve el % de ancho de la barra para el HTML
  getBarWidth(movido: number): string {
    const max = this.maxMovement();
    if (max === 0) return '0%';
    const percentage = (movido / max) * 100;
    return `${percentage}%`;
  }
}