import { Component, DestroyRef, computed, inject, signal } from '@angular/core';
import { Router, RouterOutlet, NavigationEnd } from '@angular/router';
import { filter } from 'rxjs';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';

import { AuthStateService } from '@core/auth/services/auth-state.service';

@Component({
  selector: 'app-reports-principal',
  standalone: true,
  imports: [RouterOutlet],
  templateUrl: './reports-principal.component.html',
})
export class ReportsPrincipalComponent {
  private readonly router = inject(Router);
  private readonly authState = inject(AuthStateService);
  private readonly destroyRef = inject(DestroyRef);

  readonly canViewTransactions = computed(() =>
    this.authState.hasPermission('TRANSACTION_LIST_ALL'),
  );

  readonly canViewModifications = computed(() =>
    this.authState.hasPermission('MODIFICATION_LIST_ALL'),
  );

  readonly canViewSummary = computed(() => this.authState.hasPermission('MENU_REPORT_GET_BY_DATE'));

  readonly canExport = computed(() => this.authState.hasPermission('MENU_REPORT_EXPORT'));

  readonly currentModule = signal<string>('');

  readonly availableModules = computed(() => {
    const modules: { value: string; label: string }[] = [];

    if (this.canViewTransactions()) {
      modules.push({ value: 'transactions', label: 'Transacciones' });
    }

    if (this.canViewSummary()) {
      modules.push({ value: 'summary', label: 'Resumen de reportes' });
    }

    if (this.canViewModifications()) {
      modules.push({ value: 'modifications', label: 'Modificaciones' });
    }

    return modules;
  });

  readonly hasAnyReportPermission = computed(() => this.availableModules().length > 0);

  constructor() {
    this.syncCurrentModule();

    this.router.events
      .pipe(
        filter((event): event is NavigationEnd => event instanceof NavigationEnd),
        takeUntilDestroyed(this.destroyRef),
      )
      .subscribe(() => {
        this.syncCurrentModule();
      });
  }

  changeModule(event: Event): void {
    const value = (event.target as HTMLSelectElement).value;

    if (!value) return;

    this.router.navigate(['/reports', value]);
  }

  private syncCurrentModule(): void {
    const url = this.router.url;

    if (url.includes('transactions')) {
      this.currentModule.set('transactions');
      return;
    }

    if (url.includes('summary')) {
      this.currentModule.set('summary');
      return;
    }

    if (url.includes('modifications')) {
      this.currentModule.set('modifications');
      return;
    }

    this.currentModule.set('');
  }
}
