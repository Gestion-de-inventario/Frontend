export interface ProductoRotacion {
  nombre: string;
  unidad: string;
  totalMovido: number;
}

export interface ResumenMensual {
  fecha: string;
  ingresosDiarios: number;
  egresosDiarios: number;
  netoDiario: number;
}

export interface DashboardResponse {
  topProductos: ProductoRotacion[];
  totalIngresos: number;
  totalEgresos: number;
  balanceNeto: number;
  resumenMensual: ResumenMensual[];
}