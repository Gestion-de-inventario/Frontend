import { Component, computed, inject, OnInit, signal } from '@angular/core';
import { Router } from '@angular/router';
import { AuthStateService } from '@core/auth/services/auth-state.service';
import { QuickAccess } from './interfaces/quickaccesses';

@Component({
  selector: 'app-home',
  imports: [],
  templateUrl: './home-principal.component.html',
  styleUrl: './home-principal.component.scss',
})
export class HomePrincipalComponent implements OnInit {
  readonly authState = inject(AuthStateService);

  private readonly router = inject(Router);

  readonly currentTime = signal(new Date());

  readonly currentPeriod = computed(() => {
    const hour = Number(
      new Intl.DateTimeFormat('es-PE', {
        timeZone: 'America/Lima',
        hour: 'numeric',
        hour12: false,
      }).format(this.currentTime()),
    );

    if (hour >= 5 && hour < 12) {
      return 'morning';
    }

    if (hour >= 12 && hour < 18) {
      return 'afternoon';
    }
    console.log(hour);
    return 'night';
  });

  readonly greeting = computed(() => {
    switch (this.currentPeriod()) {
      case 'morning':
        return 'Buenos días';

      case 'afternoon':
        return 'Buenas tardes';

      default:
        return 'Buenas noches';
    }
  });

  readonly periodIcon = computed(() => {
    switch (this.currentPeriod()) {
      case 'morning':
        return 'bi-sun';

      case 'afternoon':
        return 'bi-sun-fill';

      default:
        return 'bi-moon-stars-fill';
    }
  });

  readonly formattedTime = computed(() => {
    return new Intl.DateTimeFormat('es-PE', {
      timeZone: 'America/Lima',
      hour: 'numeric',
      minute: '2-digit',
      hour12: true,
    }).format(this.currentTime());
  });

  readonly quickAccesses: QuickAccess[] = [
    {
      title: 'Registrar menú',
      description: 'Crear el menú del día',
      icon: 'bi-journal-plus',
      route: '/menu-report',
      permissions: ['MENU_REPORT_CREATE_REPORT'],
    },
    {
      title: 'Registrar recojo',
      description: 'Registrar la entrega del menú',
      icon: 'bi-box-arrow-in-down',
      route: '/history/menu-report',
      permissions: [
        'MENU_REPORT_LIST_ALL',
        'MENU_REPORT_ADD_BENEFICIARY',
        'MENU_REPORT_EDIT_BENEFICIARY',
        'MENU_REPORT_REMOVE_BENEFICIARY',
        'BENEFICIARY_LIST_BY_STATUS',
      ],
      requireAllPermissions: true,
    },
    {
      title: 'Gestión de productos',
      description: 'Consultar y administrar productos',
      icon: 'bi-box-seam',
      route: '/inventory/products',
      permissions: ['PRODUCT_LIST_BY_STATUS'],
    },
    {
      title: 'Registrar ingreso de productos',
      description: 'Registrar ingreso de productos',
      icon: 'bi-box-arrow-in-down',
      route: '/purchase-order/create',
      permissions: ['CREATE_ORDER_IN', 'PRODUCT_LIST_BY_STATUS'],
      requireAllPermissions: true,
    },
    {
      title: 'Beneficiarios',
      description: 'Consultar beneficiarios',
      icon: 'bi-people',
      route: '/management/beneficiaries',
      permissions: ['BENEFICIARY_LIST_BY_STATUS'],
    },
    {
      title: 'Reportes',
      description: 'Consultar información del sistema',
      icon: 'bi-bar-chart-line',
      route: '/reports/summary',
      permissions: ['TRANSACTION_LIST_ALL', 'MODIFICATION_LIST_ALL', 'MENU_REPORT_GET_BY_DATE'],
    },
    {
      title: 'Usuarios',
      description: 'Administrar usuarios',
      icon: 'bi-person-gear',
      route: '/management/users',
      permissions: ['USER_LIST_ALL'],
    },
    {
      title: 'Roles',
      description: 'Gestionar roles y permisos',
      icon: 'bi-shield-lock',
      route: '/roles',
      permissions: ['ROLE_LIST_BY_STATUS'],
    },
    {
      title: 'Mi perfil',
      description: 'Consultar mi información',
      icon: 'bi-person-circle',
      route: '/profile',
    },
    {
      title: 'Ingresos en almacen',
      description: 'Consultar ingresos registrados',
      icon: 'bi-clipboard-check',
      route: '/purchase-order',
      permissions: ['ORDER_IN_LIST_ALL'],
    },
  ];

  ngOnInit(): void {
    // Actualiza la hora cada minuto.
    setInterval(() => {
      this.currentTime.set(new Date());
    }, 60_000);
  }

  readonly visibleQuickAccesses = computed(() => {
    const userPermissions = this.authState.permissions();

    return this.quickAccesses.filter((access) => {
      if (!access.permissions?.length) {
        return true;
      }

      if (access.requireAllPermissions) {
        return access.permissions.every((permission) => userPermissions.includes(permission));
      }

      return access.permissions.some((permission) => userPermissions.includes(permission));
    });
  });

  navigate(route: string): void {
    this.router.navigate([route]);
  }
}
