import { Routes } from '@angular/router';

import { authGuard } from './core/auth/guards/auth.guard';

import { appReadyGuard } from './core/auth/guards/appReadyGuard';

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

    canActivate: [appReadyGuard, authGuard],

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
        path: 'beneficiaries/type',

        title: 'Tipos de beneficiario',

        loadComponent: () =>
          import('@features/beneficiaryType/pages/beneficiary-type-principal/beneficiary-type-principal').then(
            (m) => m.BeneficiaryTypePrincipal,
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
      {
        path: 'transactions-modifications',
        title: 'Transacciones y Modificaciones',
        loadComponent: () =>
          import('@features/transactions_modifications/pages/transactions-modifications_principal/transactions-modifications-principal.component').then(
            (m) => m.TransactionsModificationsPrincipalComponent,
          ),
      },
      {
        path: 'menu-report',
        title: 'Orden de producción',
        loadComponent: () =>
          import('@features/menu-report/pages/menu_report_principal/menu_report_principal').then(
            (m) => m.MenuReportPrincipal,
          ),
      },

      {
        path: 'beneficiaries-control',
        title: 'Control de Salida',
        loadComponent: () =>
          import('@features/beneficiaries-control/pages/beneficiary-control/beneficiary-control').then(
            (m) => m.BeneficiaryControl,
          ),
      },

      {
        path: 'menu-report-summary',
        title: 'Resumen diario',
        loadComponent: () =>
          import('@features/menu-report-summary/pages/menu-report-summary').then(
            (m) => m.MenuReportSummary,
          ),
      },

      {
        path: 'purchase-order',
        title: 'Órdenes de compra',
        loadComponent: () =>
          import('@features/purchase-order/pages/purchase-order-principal/purchase-orden').then(
            (m) => m.PurchaseOrden,
          ),

        children: [
          {
            path: '',
            loadComponent: () =>
              import('@features/purchase-order/fragments/list-purchase-fragment/list-purchase-fragment.component').then(
                (m) => m.ListPurchaseFragmentComponent,
              ),
          },

          {
            path: 'create',
            loadComponent: () =>
              import('@features/purchase-order/fragments/create-purchase-fragment/create-purchase-fragment.component').then(
                (m) => m.PurchaseOrderCreateFragmentComponent,
              ),
          },
        ],
      },
    ],
  },
];
