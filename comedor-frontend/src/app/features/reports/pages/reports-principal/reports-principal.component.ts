import { Component, computed, inject } from '@angular/core';
import { Router, RouterOutlet } from '@angular/router';
import { AuthStateService } from '@core/auth/services/auth-state.service';


@Component({
  selector: 'app-reports-principal',
  standalone: true,
  imports: [RouterOutlet],
  templateUrl: './reports-principal.component.html',
})
export class ReportsPrincipalComponent {
  private router = inject(Router);
  private authState = inject(AuthStateService);

  canViewTransactions = computed(() =>
    this.authState.hasPermission('TRANSACTION_LIST_ALL')
  );
  canViewModifications = computed(() =>
    this.authState.hasPermission('MODIFICATION_LIST_ALL')
  );
  canViewSummary = computed(() =>
    this.authState.hasPermission('MENU_REPORT_GET_SUMMARY')
  );
  canExport = computed(() =>
    this.authState.hasPermission('MENU_REPORT_EXPORT')
  );

  currentModule = computed(() => {
    const url = this.router.url;
    if (url.includes('transactions')) return 'transactions';
    if (url.includes('modifications')) return 'modifications';
    if (url.includes('summary')) return 'summary';
    if (url.includes('export')) return 'export';
    return '';
  });

  changeModule(event: Event) {
    const value = (event.target as HTMLSelectElement).value;
    this.router.navigate(['/reports', value]);
  }
}