import { Routes } from '@angular/router';

import { authGuard } from './core/auth/guards/auth.guard';

import { guestGuard } from './core/auth/guards/guest.guard';
import { AppShellPage } from './layout/pages/app-shell/app-shell.page';

export const routes: Routes = [
  {
    path: 'login',

    canActivate: [guestGuard],

    loadComponent: () => import('@core/auth/pages/login/login.page').then((m) => m.LoginPage),
  },

  {
    path: '',

    component: AppShellPage,

    canActivate: [authGuard],

    children: [
      {
        path: 'dashboard',

        title: 'Dashboard',

        loadComponent: () =>
          import('@features/dashboard/pages/dashboard.page').then((m) => m.DashboardPage),
      },

      {
        path: 'users',

        title: 'Usuarios',

        loadComponent: () =>
          import('@features/users/pages/user_principal/user_principal').then(
            (m) => m.UserPrincipal,
          ),
      },

      {
        path: '',

        redirectTo: 'dashboard',

        pathMatch: 'full',
      },
    ],
  },
];
