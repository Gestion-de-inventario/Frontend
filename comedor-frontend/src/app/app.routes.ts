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
        path: 'roles',

        title: 'Roles',

        loadComponent: () =>
          import('@features/roles_permissions/pages/roles-permissions_principal/roles-permissions_principal').then(
            (m) => m.RolesPermissionsPrincipalComponent,
          ),
      },

      {
        path: '',

        redirectTo: 'dashboard',

        pathMatch: 'full',
      },
      {
        path: 'products',

        title: 'Productos',

        loadComponent: () =>
          import('@features/products/pages/product_principal/product_principal').then(
            (m) => m.ProductPrincipal,
          ),
      },
      {
        path: 'beneficiaries',
        title: 'Beneficiarios',
        loadComponent: () =>
          import('@features/beneficiaries/pages/beneficiary_principal/beneficiary_principal').then(
            (m) => m.BeneficiaryPrincipal,
          ),
      },
      {
        path: 'categories',
        title: 'Categorías y Etiquetas',
        loadComponent: () =>
          import('@features/categoriesandtags/pages/category_principal/category_principal').then(
            (m) => m.CategoryPrincipal,
          ),
      },
      {
        path: 'profile',
        title: 'Mi perfil',
        loadComponent: () =>
          import('@features/profile/pages/profile_principal/profile_principal').then(
            (m) => m.ProfilePrincipal,
          ),
      },
    ],
  },
];
