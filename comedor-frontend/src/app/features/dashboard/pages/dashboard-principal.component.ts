import { Component, inject, OnInit, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { finalize } from 'rxjs';

import { AuthStateService } from '@core/auth/services/auth-state.service';
import { DashboardApiService } from '../services/dashboard-api.service';
import { DashboardStateService } from '../services/dashboard-state.service';
import { DashboardCardsFragmentComponent } from '../fragments/dashboard-cards-fragment/dashboard-cards-fragment.component';
import { DashboardChartFragmentComponent } from '../fragments/dashboard-chart-fragment/dashboard-chart-fragment.component';
import { DashboardFinancialFragmentComponent } from '../fragments/dashboard-financial-fragment/dashboard-financial-fragment.component';

@Component({
  selector: 'app-dashboard-principal',
  standalone: true,
  imports: [
    RouterLink,
    DashboardCardsFragmentComponent,
    DashboardChartFragmentComponent,
    DashboardFinancialFragmentComponent,
  ],
  templateUrl: './dashboard-principal.component.html',
  styleUrl: './dashboard-principal.component.scss',
})
export class DashboardPrincipalComponent implements OnInit {
  readonly authState = inject(AuthStateService);
  readonly dashboardApi = inject(DashboardApiService);
  readonly dashboardState = inject(DashboardStateService);

  readonly canView = this.authState.hasPermission('DASHBOARD_VIEW');

  readonly periodoActual = signal<string>('Mes actual');

  ngOnInit(): void {
    if (this.canView) {
      this.loadDashboardData();
    }
  }

  loadDashboardData(anio?: number, mes?: number): void {
    this.dashboardState.setLoading(true);
    this.dashboardState.setError('');

    this.dashboardApi
      .getDashboardData(anio, mes)
      .pipe(finalize(() => this.dashboardState.setLoading(false)))
      .subscribe({
        next: (data) => {
          this.dashboardState.setDashboardData(data);
        },
        error: (err) => {
          console.error('Error cargando el dashboard', err);
          this.dashboardState.setError(
            'No se pudo cargar la información del dashboard. Verifica tu conexión e inténtalo nuevamente.',
          );
        },
      });
  }

  retryLoad(): void {
    this.loadDashboardData();
  }
}
