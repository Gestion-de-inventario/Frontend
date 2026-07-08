import { Component, inject, signal, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AuthStateService } from '@core/auth/services/auth-state.service';

export interface TourStep {
  icon: string;
  titulo: string;
  descripcion: string;
  permiso?: string;
}

declare const bootstrap: any;

@Component({
  selector: 'app-tour-modal',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './tour-modal.component.html',
})
export class TourModalComponent implements OnInit {
  readonly authState = inject(AuthStateService);

  pasoActual = signal(0);
  pasos: TourStep[] = [];

  readonly todosPasos: TourStep[] = [
    {
      icon: '📊',
      titulo: 'Dashboard',
      descripcion:
        'Visualiza un resumen del inventario: los 5 productos con mayor rotación del mes, el valor total del stock actual y el consolidado mensual de gastos e ingresos.',
    },
    {
      icon: '🍽️',
      titulo: 'Registro de Menú',
      descripcion:
        'Registra el menú del día seleccionando el plato que se cocinará y la cantidad de raciones. El sistema descuenta automáticamente los insumos del inventario.',
      permiso: 'MENU_REPORT_LIST_ALL',
    },
    {
      icon: '✅',
      titulo: 'Orden de Salida',
      descripcion:
        'Controla la entrega de menús a los beneficiarios. Registra quién recogió su menú, la cantidad y si realizó el pago.',
      permiso: 'MENU_REPORT_ADD_BENEFICIARY',
    },
    {
      icon: '📦',
      titulo: 'Orden de Entrada',
      descripcion:
        'Registra las compras y donaciones de insumos. Al confirmar una orden, el stock de los productos se actualiza automáticamente.',
      permiso: 'CREATE_ORDER_IN',
    },
    {
      icon: '👥',
      titulo: 'Usuarios',
      descripcion:
        'Administra los usuarios del sistema, los beneficiarios del comedor y sus tipos. Puedes crear, editar y cambiar el estado de cada uno.',
      permiso: 'USER_LIST_ALL',
    },
    {
      icon: '📦',
      titulo: 'Inventario',
      descripcion:
        'Gestiona los insumos (productos), los platos registrados con sus recetas, las categorías y las etiquetas para organizar mejor el stock.',
      permiso: 'PRODUCT_LIST_BY_STATUS',
    },
    {
      icon: '🛡️',
      titulo: 'Roles',
      descripcion:
        'Crea y administra roles personalizados asignando permisos específicos. Cada usuario del sistema tendrá acceso solo a los módulos que le correspondan.',
      permiso: 'ROLE_LIST_BY_STATUS',
    },
    {
      icon: '📈',
      titulo: 'Reportes',
      descripcion:
        'Consulta el historial de transacciones y modificaciones con filtros por fecha. Exporta reportes en PDF del menú diario, transacciones y modificaciones.',
      permiso: 'TRANSACTION_LIST_ALL',
    },
  ];

  ngOnInit(): void {
    // Filtra pasos según permisos del usuario
    this.pasos = this.todosPasos.filter(
      (paso) => !paso.permiso || this.authState.hasPermission(paso.permiso),
    );
  }

  get pasoData(): TourStep {
    return this.pasos[this.pasoActual()];
  }

  get esUltimoPaso(): boolean {
    return this.pasoActual() === this.pasos.length - 1;
  }

  get esPrimerPaso(): boolean {
    return this.pasoActual() === 0;
  }

  siguiente(): void {
    if (!this.esUltimoPaso) {
      this.pasoActual.update((p) => p + 1);
    } else {
      this.cerrar();
    }
  }

  anterior(): void {
    if (!this.esPrimerPaso) {
      this.pasoActual.update((p) => p - 1);
    }
  }

  cerrar(): void {
    const userId = this.authState.session()?.id;
    if (userId) {
      localStorage.setItem(`tour_completado_${userId}`, 'true');
    }
    bootstrap.Modal.getInstance(document.getElementById('tourModal')!)?.hide();
  }

  abrir(): void {
    this.pasoActual.set(0);
    const modal = new bootstrap.Modal(document.getElementById('tourModal')!);
    modal.show();
  }
}
