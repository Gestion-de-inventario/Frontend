import { Component, computed, inject } from '@angular/core';
import { DashboardStateService } from '../../services/dashboard-state.service';
import { CurrencyPipe, DatePipe } from '@angular/common';

@Component({
  selector: 'app-dashboard-financial-fragment',
  standalone: true,
  imports: [CurrencyPipe, DatePipe],
  templateUrl: './dashboard-financial-fragment.component.html'
})
export class DashboardFinancialFragmentComponent {
  readonly state = inject(DashboardStateService);
  
  readonly resumenDiario = computed(() => this.state.dashboardData()?.resumenMensual || []);
}