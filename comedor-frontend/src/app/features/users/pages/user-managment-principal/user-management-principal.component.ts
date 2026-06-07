import { Component, inject } from '@angular/core';
import { Router, RouterModule } from '@angular/router';

@Component({
  selector: 'app-user-management-principal',
  standalone: true,
  imports: [RouterModule],
  templateUrl: './user-management-principal.component.html',
})
export class UserManagementPrincipalComponent {
  private readonly router = inject(Router);

  currentModule = 'users';

  changeModule(event: Event): void {
    const value = (event.target as HTMLSelectElement).value;

    this.currentModule = value;

    this.router.navigate(['/management', value]);
  }

  ngOnInit(): void {
    const url = this.router.url;

    if (url.includes('beneficiaries')) {
      this.currentModule = 'beneficiaries';
    } else if (url.includes('beneficiary-types')) {
      this.currentModule = 'beneficiary-types';
    } else {
      this.currentModule = 'users';
    }
  }
}
