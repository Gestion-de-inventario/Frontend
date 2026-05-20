import { AuthStateService } from '../auth/services/auth-state.service';

export function initAuth(authState: AuthStateService) {
  return () =>
    authState
      .initAuth()
      .toPromise()
      .catch(() => {});
}
