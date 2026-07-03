import { Component, inject, signal } from '@angular/core';
import { Router, RouterOutlet } from '@angular/router';
import { AuthStateService } from '@core/auth/services/auth-state.service';
import { Loading } from '@shared/pages/loading/loading';
@Component({
  selector: 'app-root',
  imports: [RouterOutlet, Loading],
  templateUrl: './app.html',
  styleUrl: './app.scss',
})
export class App {
  authState = inject(AuthStateService);
  router = inject(Router);
  protected readonly title = signal('comedor-frontend');

  ngOnInit(): void {
    this.authState.initAuth().subscribe({
      complete: () => {
        const currentUrl = this.router.url;

        if (this.authState.isAuthenticated()) {
          if (currentUrl === '/' || currentUrl === '/login') {
            this.router.navigateByUrl('/dashboard', { replaceUrl: true });
          }

          return;
        }

        if (currentUrl !== '/login') {
          this.router.navigateByUrl('/login', { replaceUrl: true });
        }
      },
    });
  }
}
