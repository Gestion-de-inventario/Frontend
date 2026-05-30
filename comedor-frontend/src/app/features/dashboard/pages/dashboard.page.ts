import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AuthStateService } from '@core/auth/services/auth-state.service';

@Component({
  selector: 'app-dashboard',
  imports: [CommonModule],
  templateUrl: './dashboard.page.html',
  styleUrl: './dashboard.page.scss',
})
export class DashboardPage {

 readonly authState = inject(AuthStateService);

  readonly today = new Date().toLocaleDateString('es-PE', {
    weekday: 'long', year: 'numeric', month: 'long', day: 'numeric'
  });

  readonly kpis = {
    menusHoy: 45,
    beneficiarios: 50,
    ingresosHoy: 120.50,
    alertasStock: 3
  };

  readonly actividadReciente = [
    { accion: 'Reporte de menú creado', detalle: 'Arroz con Pollo (150 porciones)', tiempo: 'Hace 2 horas', color: 'primary' },
    { accion: 'Compra registrada', detalle: 'Verduras y abarrotes', tiempo: 'Hace 4 horas', color: 'success' },
    { accion: 'Nuevo beneficiario', detalle: 'María López registrada', tiempo: 'Hace 5 horas', color: 'info' },
    { accion: 'Alerta de inventario', detalle: 'Aceite por debajo del mínimo', tiempo: 'Hace 1 día', color: 'danger' }
  ];

  readonly stockBajo = [
    { producto: 'Arroz', unidad: 'KILOGRAMOS', actual: 5, minimo: 15, porcentaje: 33 },
    { producto: 'Aceite Vegetal', unidad: 'LITROS', actual: 2, minimo: 10, porcentaje: 20 },
    { producto: 'Lentejas', unidad: 'KILOGRAMOS', actual: 1, minimo: 8, porcentaje: 12 }
  ];

  getColorForStock(porcentaje: number): string {
    if (porcentaje < 20) return 'bg-danger';
    if (porcentaje < 40) return 'bg-warning';
    return 'bg-success';
  }
}
