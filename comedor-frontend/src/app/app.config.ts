import {
  provideAppInitializer,
  ApplicationConfig,
  provideBrowserGlobalErrorListeners,
  inject,
} from '@angular/core';

import { provideHttpClient, withInterceptors } from '@angular/common/http';
import { provideRouter } from '@angular/router';

import { routes } from './app.routes';

import { authInterceptor } from '@core/auth/interceptors/auth.interceptor';
import { AuthStateService } from '@core/auth/services/auth-state.service';

export const appConfig: ApplicationConfig = {
  providers: [
    provideBrowserGlobalErrorListeners(),
    provideRouter(routes),
    provideHttpClient(withInterceptors([authInterceptor])),
  ],
};
