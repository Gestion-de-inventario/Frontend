import { Component, inject } from '@angular/core';
import { CurrencyPipe } from '@angular/common';
import { DashboardStateService } from '../../services/dashboard-state.service';

@Component({
  selector: 'app-dashboard-cards-fragment',
  standalone: true,
  imports: [CurrencyPipe], // Importante para formatear el dinero
  templateUrl: './dashboard-cards-fragment.component.html'
})
export class DashboardCardsFragmentComponent {
  readonly state = inject(DashboardStateService);
  // Señal computada implícita leyendo del estado
  readonly data = this.state.dashboardData;
}