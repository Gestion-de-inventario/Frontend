import { inject } from '@angular/core';

import { CanActivateFn, Router } from '@angular/router';

import { TokenService } from '../services/token.service';

export const guestGuard: CanActivateFn = () => {
  const tokenService = inject(TokenService);

  const router = inject(Router);

  const hasSession = tokenService.hasToken();

  if (hasSession) {
    router.navigate(['/dashboard']);

    return false;
  }

  return true;
};
