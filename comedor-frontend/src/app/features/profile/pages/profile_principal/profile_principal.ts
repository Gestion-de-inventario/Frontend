import { Component, inject } from '@angular/core';
import { AuthStateService } from '@core/auth/services/auth-state.service';

@Component({
  selector: 'app-profile-principal',
  standalone: true,
  imports: [],
  templateUrl: './profile_principal.html',
  styleUrl: './profile_principal.scss',
})
export class ProfilePrincipal {
  readonly authState = inject(AuthStateService);
}