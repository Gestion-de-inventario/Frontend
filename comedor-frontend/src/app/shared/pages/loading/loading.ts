import { Component, inject } from '@angular/core';
import { AuthStateService } from '@core/auth/services/auth-state.service';

@Component({
  selector: 'app-loading',
  imports: [],
  templateUrl: './loading.html',
  styleUrl: './loading.scss',
})
export class Loading {
  public readonly authState = inject(AuthStateService);
}
