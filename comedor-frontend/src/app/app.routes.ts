import { Routes } from '@angular/router';

import { authGuard } from './core/auth/guards/auth.guard';

import { guestGuard } from './core/auth/guards/guest.guard';

export const routes: Routes = [
  {
    path: 'login',

    canActivate: [guestGuard],

    loadComponent: () => import('@core/auth/pages/login/login.page').then((m) => m.LoginPage),
  },

  {
    path: 'dashboard',

    canActivate: [authGuard],

    loadComponent: () =>
      import('@features/dashboard/pages/dashboard.page').then((m) => m.DashboardPage),
  },

  {
    path: '',

    pathMatch: 'full',

    redirectTo: 'dashboard',
  },

  {
    path: '**',

    redirectTo: 'dashboard',
  },
];
