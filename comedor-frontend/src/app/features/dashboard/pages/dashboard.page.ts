import { Component } from '@angular/core';
import { inject } from '@angular/core';
import { AuthStateService } from '@core/auth/services/auth-state.service';
import { Router } from '@angular/router';
import { ButtonComponent } from '@shared/components/ui/button/button';
@Component({
  selector: 'app-dashboard',
  imports: [ButtonComponent],
  templateUrl: './dashboard.page.html',
  styleUrl: './dashboard.page.scss',
})
export class DashboardPage {
  private auth = inject(AuthStateService);
  private router = inject(Router);

  logout(): void {
    this.auth.logout().subscribe({
      next: () => {
        this.router.navigateByUrl('/login', { replaceUrl: true });
      },
      error: () => {
        this.router.navigateByUrl('/login', { replaceUrl: true });
      },
    });
  }
}
