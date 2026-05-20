import { inject } from '@angular/core';
import { CanActivateFn, Router, UrlTree } from '@angular/router';
import { TokenService } from '../services/token.service';

export const authGuard: CanActivateFn = () => {
  const tokenService = inject(TokenService);
  const router = inject(Router);

  const hasSession = tokenService.hasToken();

  if (!hasSession) {
    return router.createUrlTree(['/login']); // ✔ correcto
  }

  return true;
};
