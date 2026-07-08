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
          import('@features/dashboard/pages/dashboard-principal.component').then(
            (m) => m.DashboardPrincipalComponent,
          ),
      },
      {
        path: 'management',
        title: 'Gestión de Usuarios',
        loadComponent: () =>
          import('@features/users/pages/user-managment-principal/user-management-principal.component').then(
            (m) => m.UserManagementPrincipalComponent,
          ),
        children: [
          {
            path: 'users',
            loadComponent: () =>
              import('@features/users/pages/user_principal/user_principal').then(
                (m) => m.UserPrincipal,
              ),
          },
          {
            path: 'beneficiaries',
            loadComponent: () =>
              import('@features/beneficiaries/pages/beneficiary_principal/beneficiary_principal').then(
                (m) => m.BeneficiaryPrincipal,
              ),
          },
          {
            path: 'beneficiary-types',
            loadComponent: () =>
              import('@features/beneficiaryType/pages/beneficiary-type-principal/beneficiary-type-principal').then(
                (m) => m.BeneficiaryTypePrincipal,
              ),
          },
        ],
      },
      {
        path: 'roles',
        title: 'Roles',
        loadComponent: () =>
          import('@features/roles_permissions/pages/roles-permissions_principal/roles-permissions_principal').then(
            (m) => m.RolesPermissionsPrincipalComponent,
          ),
      },
      { path: '', redirectTo: 'dashboard', pathMatch: 'full' },
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
        title: 'Registro Menú',
        loadComponent: () =>
          import('@features/menu-report/pages/menu_report_principal/menu_report_principal').then(
            (m) => m.MenuReportPrincipal,
          ),
        children: [
          {
            path: 'list',
            loadComponent: () =>
              import('@features/menu-report/fragments/menu-report-list-fragment/list-menu-report-fragment.component').then(
                (m) => m.ListMenuReportFragmentComponent,
              ),
          },
          {
            path: '',
            loadComponent: () =>
              import('@features/menu-report/fragments/menu-report-create-fragment/menu-report-create-fragment.component').then(
                (m) => m.MenuReportCreateFragmentComponent,
              ),
          },
        ],
      },
      {
        path: 'beneficiaries-control',
        title: 'Orden de Salida',
        loadComponent: () =>
          import('@features/beneficiaries-control/pages/beneficiary-control/beneficiary-control').then(
            (m) => m.BeneficiaryControl,
          ),
        children: [
          {
            path: '',
            loadComponent: () =>
              import('@features/beneficiaries-control/fragments/list-menu-report-fragment/list-menu-report-fragment.component').then(
                (m) => m.ListMenuReportFragmentComponent,
              ),
          },
          {
            path: 'manage/:id',
            loadComponent: () =>
              import('@features/beneficiaries-control/fragments/menu-report-beneficiaries-fragment/menu-report-beneficiaries-fragment.component').then(
                (m) => m.MenuReportBeneficiariesFragmentComponent,
              ),
          },
        ],
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
        title: 'Ingreso de insumos',
        loadComponent: () =>
          import('@features/order-in/pages/purchase-order-principal/purchase-orden').then(
            (m) => m.PurchaseOrden,
          ),
        children: [
          {
            path: '',
            loadComponent: () =>
              import('@features/order-in/fragments/list-purchase-fragment/list-purchase-fragment.component').then(
                (m) => m.ListPurchaseFragmentComponent,
              ),
          },
          {
            path: 'create',
            loadComponent: () =>
              import('@features/order-in/fragments/create-orden-in-fragment/create-orden-in-fragment.component').then(
                (m) => m.InventoryOrderCreateFragmentComponent,
              ),
          },
        ],
      },
      {
        path: 'inventory',
        title: 'Inventario',
        loadComponent: () =>
          import('@features/inventory/pages/inventory-principal/inventory-principal.component').then(
            (m) => m.InventoryPrincipalComponent,
          ),
        children: [
          { path: '', redirectTo: 'products', pathMatch: 'full' },
          {
            path: 'products',
            loadComponent: () =>
              import('@features/products/pages/product_principal/product_principal').then(
                (m) => m.ProductPrincipal,
              ),
          },
          {
            path: 'dishes',
            loadComponent: () =>
              import('@features/dish-menus/pages/dish_principal/dish_principal').then(
                (m) => m.DishPrincipal,
              ),
          },
          {
            path: 'categories',
            loadComponent: () =>
              import('@features/categoriesandtags/pages/category_principal/category_principal').then(
                (m) => m.CategoryPrincipal,
              ),
          },
          {
            path: 'tags',
            loadComponent: () =>
              import('@features/categoriesandtags/pages/tag_principal/tag_principal').then(
                (m) => m.TagPrincipal,
              ),
          },
        ],
      },
      {
        path: 'reports',
        title: 'Reportes',
        loadComponent: () =>
          import('@features/reports/pages/reports-principal/reports-principal.component').then(
            (m) => m.ReportsPrincipalComponent,
          ),
        children: [
          { path: '', redirectTo: 'transactions', pathMatch: 'full' },
          {
            path: 'transactions',
            loadComponent: () =>
              import('@features/transactions_modifications/fragments/transactions-fragment/transactions-fragment.component').then(
                (m) => m.TransactionsFragmentComponent,
              ),
          },
          {
            path: 'modifications',
            loadComponent: () =>
              import('@features/transactions_modifications/fragments/modifications-fragment/modifications-fragment.component').then(
                (m) => m.ModificationsFragmentComponent,
              ),
          },
          {
            path: 'summary',
            loadComponent: () =>
              import('@features/menu-report-summary/pages/menu-report-summary').then(
                (m) => m.MenuReportSummary,
              ),
          },
          {
            path: 'export',
            loadComponent: () =>
              import('@features/exports-report/fragments/export-report-fragment.component').then(
                (m) => m.ExportReportFragmentComponent,
              ),
          },
        ],
      },
    ],
  },
];
