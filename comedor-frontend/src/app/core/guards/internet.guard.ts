import { CanActivateFn } from '@angular/router';

export const internetGuard: CanActivateFn = () => {
  if (!navigator.onLine) {
    alert('Sin conexión a internet');

    return false;
  }

  return true;
};
