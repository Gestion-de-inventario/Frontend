import { Component, inject, signal } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { AuthStateService } from '@core/auth/services/auth-state.service';
import { Loading } from '@shared/pages/loading/loading';
@Component({
  selector: 'app-root',
  imports: [RouterOutlet, Loading],
  templateUrl: './app.html',
  styleUrl: './app.scss',
})
export class App {
  public authState = inject(AuthStateService);
  protected readonly title = signal('comedor-frontend');

  ngOnInit(): void {
    this.authState.initAuth().subscribe();
  }
}
