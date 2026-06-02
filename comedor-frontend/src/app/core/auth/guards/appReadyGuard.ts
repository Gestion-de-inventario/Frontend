import { CanActivateFn } from '@angular/router';
import { AuthStateService } from '../services/auth-state.service';
import { inject } from '@angular/core';

export const appReadyGuard: CanActivateFn = () => {
  const authState = inject(AuthStateService);

  return !authState.initializing();
};
