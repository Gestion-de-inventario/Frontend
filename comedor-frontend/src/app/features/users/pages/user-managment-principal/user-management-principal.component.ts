import { Component, inject } from '@angular/core';
import { Router, RouterModule } from '@angular/router';
import { AuthService } from '@core/auth/services/auth-api.service.ts';
import { AuthStateService } from '@core/auth/services/auth-state.service';

@Component({
  selector: 'app-user-management-principal',
  standalone: true,
  imports: [RouterModule],
  templateUrl: './user-management-principal.component.html',
})
export class UserManagementPrincipalComponent {
  private readonly router = inject(Router);
  private readonly authservice = inject(AuthStateService);

  public canListUsers = this.authservice.hasPermission('USER_LIST_ALL');
  public canListActivedUsers = this.authservice.hasPermission('USER_LIST_ACTIVE');
  public canCreateUser = this.authservice.hasPermission('USER_CREATE');

  public canListBeneficiaries = this.authservice.hasPermission('BENEFICIARY_LIST_BY_STATUS');
  public canCreateBeneficiary = this.authservice.hasPermission('BENEFICIARY_CREATE');
  public canCreateBeneficiaryByDni = this.authservice.hasPermission('BENEFICIARY_CREATE_BY_DNI');

  public canListBeneficiariesTypes = this.authservice.hasPermission(
    'BENEFICIARY_TYPE_LIST_BY_STATUS',
  );
  public canCreateBeneficiaryType = this.authservice.hasPermission('BENEFICIARY_TYPE_CREATE');

  currentModule = 'users';

  changeModule(event: Event): void {
    const value = (event.target as HTMLSelectElement).value;

    this.currentModule = value;

    this.router.navigate(['/management', value]);
  }

  private getFirstAllowedModule(): string | null {
    if (this.canListUsers || this.canCreateUser || this.canListActivedUsers) {
      return 'users';
    }

    if (this.canListBeneficiaries || this.canCreateBeneficiary || this.canCreateBeneficiaryByDni) {
      return 'beneficiaries';
    }

    if (this.canListBeneficiariesTypes || this.canCreateBeneficiaryType) {
      return 'beneficiary-types';
    }

    return null;
  }

  ngOnInit(): void {
    const url = this.router.url;

    if (url.endsWith('/management')) {
      const firstAllowed = this.getFirstAllowedModule();

      if (firstAllowed) {
        this.currentModule = firstAllowed;
        this.router.navigate(['/management', firstAllowed]);
      }

      return;
    }

    if (url.includes('/management/beneficiary-types')) {
      this.currentModule = 'beneficiary-types';
      return;
    }

    if (url.includes('/management/beneficiaries')) {
      this.currentModule = 'beneficiaries';
      return;
    }

    if (url.includes('/management/users')) {
      this.currentModule = 'users';
      return;
    }

    const firstAllowed = this.getFirstAllowedModule();

    if (firstAllowed) {
      this.currentModule = firstAllowed;
    }
  }
}
