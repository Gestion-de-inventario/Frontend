import { inject } from '@angular/core';

import { CanActivateFn } from '@angular/router';
import { AuthStateService } from '../services/auth-state.service';
import { Router } from '@angular/router';

export const guestGuard: CanActivateFn = () => {
  const authState = inject(AuthStateService);
  const router = inject(Router);

  return authState.isAuthenticated() ? router.createUrlTree(['/dashboard']) : true;
};
