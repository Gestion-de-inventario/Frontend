export const PERMISSION_MODULE_LABELS: Record<string, string> = {
  BENEFICIARY: 'Beneficiarios',
  CATEGORY: 'Categorías',
  MENU_RECORD: 'Reportes de menú',
  PRODUCT: 'Productos',
  TAG: 'Etiquetas',
  TRANSACTION: 'Transacciones',
  USER: 'Usuarios',
  ROLE: 'Roles',
  PERMISSION: 'Permisos',
  MODIFICATION: 'Modificaciones',
  DISH_MENU: 'Menús',
  BENEFICIARY_TYPE: 'Tipos de beneficiario',
  ORDER: 'Órdenes de entrada',
  PURCHASE: 'Órdenes de compra',
  DONATION: 'Donaciones',
  REPORTS: 'Reportes',
  EMPRESA_CONFIG: 'Configuración de empresa',
};

export const PERMISSION_TITLE_LABELS: Record<string, string> = {
  // BENEFICIARIOS
  BENEFICIARY_CREATE: 'Crear beneficiarios',
  BENEFICIARY_SEARCH_BY_DNI: 'Buscar beneficiario por DNI',
  BENEFICIARY_CREATE_BY_DNI: 'Crear beneficiario mediante RENIEC',
  BENEFICIARY_EDIT: 'Editar beneficiarios',
  BENEFICIARY_LIST_BY_STATUS: 'Listar beneficiarios por estado',
  BENEFICIARY_CHANGE_STATUS: 'Cambiar estado de beneficiarios',

  // CATEGORÍAS
  CATEGORY_LIST_BY_STATUS: 'Listar categorías por estado',
  CATEGORY_CREATE: 'Crear categorías',
  CATEGORY_CHANGE_STATUS: 'Cambiar estado de categorías',

  // REPORTES DE MENÚ
  MENU_REPORT_CREATE_REPORT: 'Crear reporte de menú',
  MENU_REPORT_GET_BY_DATE: 'Consultar reporte por fecha',
  MENU_REPORT_ADD_PRODUCT: 'Agregar productos al reporte',
  MENU_REPORT_EDIT: 'Editar reporte',
  MENU_REPORT_REMOVE_PRODUCT: 'Eliminar productos del reporte',
  MENU_REPORT_ADD_BENEFICIARY: 'Agregar beneficiarios al reporte',
  MENU_REPORT_EDIT_BENEFICIARY: 'Editar beneficiarios del reporte',
  MENU_REPORT_REMOVE_BENEFICIARY: 'Eliminar beneficiarios del reporte',
  MENU_REPORT_LIST_ALL: 'Listar reportes',
  MENU_REPORT_EXPORT: 'Exportar reporte',

  // PRODUCTOS
  PRODUCT_LIST_BY_STATUS: 'Listar productos por estado',
  PRODUCT_CREATE: 'Crear productos',
  PRODUCT_CHANGE_STATUS: 'Cambiar estado de productos',
  PRODUCT_EDIT: 'Editar productos',
  PRODUCT_ALERT_STOCK_VIEW: 'Visualizar alertas de stock',

  // ETIQUETAS
  TAG_LIST_BY_STATUS: 'Listar etiquetas por estado',
  TAG_CREATE: 'Crear etiquetas',
  TAG_CHANGE_STATUS: 'Cambiar estado de etiquetas',

  // TRANSACCIONES
  TRANSACTION_LIST_ALL: 'Listar transacciones',

  // USUARIOS
  USER_LIST_ALL: 'Listar todos los usuarios',
  USER_LIST_ACTIVE: 'Listar usuarios activos',
  USER_CREATE: 'Crear usuarios',
  USER_EDIT: 'Editar usuarios',
  USER_DEACTIVATE: 'Desactivar usuarios',
  USER_ACTIVATE: 'Activar usuarios',

  // ROLES
  ROLE_CREATE: 'Crear roles',
  ROLE_EDIT: 'Editar roles',
  ROLE_LIST_BY_STATUS: 'Listar roles por estado',
  ROLE_GET_BY_ID: 'Consultar rol por identificador',
  ROLE_ASSIGN_PERMISSIONS: 'Asignar permisos a roles',
  ROLE_CHANGE_STATUS: 'Cambiar estado de roles',

  // PERMISOS
  PERMISSION_LIST_ALL: 'Listar permisos',

  // MODIFICACIONES
  MODIFICATION_LIST_ALL: 'Listar modificaciones',

  // MENÚS
  DISH_MENU_LIST_ALL: 'Listar platos',
  DISH_MENU_CREATE: 'Crear plato',
  DISH_MENU_EDIT: 'Editar platoss',
  DISH_MENU_CHANGE_STATUS: 'Cambiar estado de plato',

  // ÓRDENES DE ENTRADA
  CREATE_ORDER_IN: 'Crear orden de entrada',

  ORDER_IN_LIST_ALL: 'Listar ordenes',

  // ÓRDENES DE COMPRA
  PURCHASE_LIST_ALL: 'Listar compras',
  PURCHASE_CHANGE_STATUS: 'Cambiar estado de compras',

  // DONACIONES
  DONATION_LIST_ALL: 'Listar donaciones',
  DONATION_CHANGE_STATUS: 'Cambiar estado de donaciones',

  // TIPOS DE BENEFICIARIO
  BENEFICIARY_TYPE_CREATE: 'Crear tipos de beneficiario',
  BENEFICIARY_TYPE_EDIT: 'Editar tipos de beneficiario',
  BENEFICIARY_TYPE_CHANGE_STATUS: 'Cambiar estado de tipos de beneficiario',
  BENEFICIARY_TYPE_LIST_BY_STATUS: 'Listar tipos de beneficiario por estado',

  // DASHBOARD / REPORTES
  DASHBOARD_VIEW: 'Visualizar dashboard',

  // CONFIGURACIÓN
  EMPRESA_CONFIG_VIEW: 'Visualizar información de Empresa',
  EMPRESA_CONFIG_EDIT: 'Editar empresa',
};

export const PERMISSION_LABELS: Record<string, string> = {
  // BENEFICIARIOS
  BENEFICIARY_CREATE: 'Crear',
  BENEFICIARY_SEARCH_BY_DNI: 'Buscar por DNI',
  BENEFICIARY_CREATE_BY_DNI: 'Crear mediante RENIEC',
  BENEFICIARY_EDIT: 'Editar',
  BENEFICIARY_LIST_BY_STATUS: 'Listar por estado',
  BENEFICIARY_CHANGE_STATUS: 'Cambiar estado',

  // CATEGORÍAS
  CATEGORY_LIST_BY_STATUS: 'Listar por estado',
  CATEGORY_CREATE: 'Crear',
  CATEGORY_CHANGE_STATUS: 'Cambiar estado',

  // REPORTES DE MENÚ
  MENU_REPORT_CREATE_REPORT: 'Crear',
  MENU_REPORT_GET_BY_DATE: 'Consultar por fecha',
  MENU_REPORT_ADD_PRODUCT: 'Agregar productos',
  MENU_REPORT_EDIT: 'Editar',
  MENU_REPORT_REMOVE_PRODUCT: 'Eliminar productos',
  MENU_REPORT_ADD_BENEFICIARY: 'Agregar beneficiarios',
  MENU_REPORT_EDIT_BENEFICIARY: 'Editar beneficiarios',
  MENU_REPORT_REMOVE_BENEFICIARY: 'Eliminar beneficiarios',
  MENU_REPORT_LIST_ALL: 'Listar',
  MENU_REPORT_EXPORT: 'Exportar',

  // PRODUCTOS
  PRODUCT_LIST_BY_STATUS: 'Listar por estado',
  PRODUCT_CREATE: 'Crear',
  PRODUCT_CHANGE_STATUS: 'Cambiar estado',
  PRODUCT_EDIT: 'Editar',
  PRODUCT_ALERT_STOCK_VIEW: 'Visualizar alertas',

  // ETIQUETAS
  TAG_LIST_BY_STATUS: 'Listar por estado',
  TAG_CREATE: 'Crear',
  TAG_CHANGE_STATUS: 'Cambiar estado',

  // TRANSACCIONES
  TRANSACTION_LIST_ALL: 'Listar',

  // USUARIOS
  USER_LIST_ALL: 'Listar todos',
  USER_LIST_ACTIVE: 'Listar activos',
  USER_CREATE: 'Crear',
  USER_EDIT: 'Editar',
  USER_DEACTIVATE: 'Desactivar',
  USER_ACTIVATE: 'Activar',

  // ROLES
  ROLE_CREATE: 'Crear',
  ROLE_EDIT: 'Editar',
  ROLE_LIST_BY_STATUS: 'Listar por estado',
  ROLE_GET_BY_ID: 'Consultar por identificador',
  ROLE_ASSIGN_PERMISSIONS: 'Asignar permisos',
  ROLE_CHANGE_STATUS: 'Cambiar estado',

  // PERMISOS
  PERMISSION_LIST_ALL: 'Listar',

  // MODIFICACIONES
  MODIFICATION_LIST_ALL: 'Listar',

  // MENÚS
  DISH_MENU_LIST_ALL: 'Listar',
  DISH_MENU_CREATE: 'Crear',
  DISH_MENU_EDIT: 'Editar',
  DISH_MENU_CHANGE_STATUS: 'Cambiar estado',

  // ÓRDENES DE ENTRADA
  CREATE_ORDER_IN: 'Crear',

  ORDER_IN_LIST_ALL: 'Listar',

  // ÓRDENES DE COMPRA
  PURCHASE_LIST_ALL: 'Listar',
  PURCHASE_CHANGE_STATUS: 'Cambiar estado',

  // DONACIONES
  DONATION_LIST_ALL: 'Listar',
  DONATION_CHANGE_STATUS: 'Cambiar estado',

  // TIPOS DE BENEFICIARIO
  BENEFICIARY_TYPE_CREATE: 'Crear',
  BENEFICIARY_TYPE_EDIT: 'Editar',
  BENEFICIARY_TYPE_CHANGE_STATUS: 'Cambiar estado',
  BENEFICIARY_TYPE_LIST_BY_STATUS: 'Listar por estado',

  // DASHBOARD / REPORTES
  DASHBOARD_VIEW: 'Visualizar',

  // CONFIGURACIÓN
  EMPRESA_CONFIG_VIEW: 'Visualizar',
  EMPRESA_CONFIG_EDIT: 'Editar',
};

export const PERMISSION_MODULES: Record<string, string> = {
  // BENEFICIARIOS
  BENEFICIARY_CREATE: 'Beneficiarios',
  BENEFICIARY_SEARCH_BY_DNI: 'Beneficiarios',
  BENEFICIARY_CREATE_BY_DNI: 'Beneficiarios',
  BENEFICIARY_EDIT: 'Beneficiarios',
  BENEFICIARY_LIST_BY_STATUS: 'Beneficiarios',
  BENEFICIARY_CHANGE_STATUS: 'Beneficiarios',

  // CATEGORÍAS
  CATEGORY_LIST_BY_STATUS: 'Categorías',
  CATEGORY_CREATE: 'Categorías',
  CATEGORY_CHANGE_STATUS: 'Categorías',

  // REPORTES DE MENÚ
  MENU_REPORT_CREATE_REPORT: 'Reportes de menú',
  MENU_REPORT_GET_BY_DATE: 'Reportes de menú',
  MENU_REPORT_ADD_PRODUCT: 'Reportes de menú',
  MENU_REPORT_EDIT: 'Reportes de menú',
  MENU_REPORT_REMOVE_PRODUCT: 'Reportes de menú',
  MENU_REPORT_ADD_BENEFICIARY: 'Reportes de menú',
  MENU_REPORT_EDIT_BENEFICIARY: 'Reportes de menú',
  MENU_REPORT_REMOVE_BENEFICIARY: 'Reportes de menú',
  MENU_REPORT_LIST_ALL: 'Reportes de menú',
  MENU_REPORT_EXPORT: 'Reportes de menú',

  // PRODUCTOS
  PRODUCT_LIST_BY_STATUS: 'Productos',
  PRODUCT_CREATE: 'Productos',
  PRODUCT_CHANGE_STATUS: 'Productos',
  PRODUCT_EDIT: 'Productos',
  PRODUCT_ALERT_STOCK_VIEW: 'Productos',

  // ETIQUETAS
  TAG_LIST_BY_STATUS: 'Etiquetas',
  TAG_CREATE: 'Etiquetas',
  TAG_CHANGE_STATUS: 'Etiquetas',

  // TRANSACCIONES
  TRANSACTION_LIST_ALL: 'Transacciones',

  // USUARIOS
  USER_LIST_ALL: 'Usuarios',
  USER_LIST_ACTIVE: 'Usuarios',
  USER_CREATE: 'Usuarios',
  USER_EDIT: 'Usuarios',
  USER_DEACTIVATE: 'Usuarios',
  USER_ACTIVATE: 'Usuarios',

  // ROLES
  ROLE_CREATE: 'Roles',
  ROLE_EDIT: 'Roles',
  ROLE_LIST_BY_STATUS: 'Roles',
  ROLE_GET_BY_ID: 'Roles',
  ROLE_ASSIGN_PERMISSIONS: 'Roles',
  ROLE_CHANGE_STATUS: 'Roles',

  // PERMISOS
  PERMISSION_LIST_ALL: 'Permisos',

  // MODIFICACIONES
  MODIFICATION_LIST_ALL: 'Modificaciones',

  // MENÚS
  DISH_MENU_LIST_ALL: 'Menús',
  DISH_MENU_CREATE: 'Menús',
  DISH_MENU_EDIT: 'Menús',
  DISH_MENU_CHANGE_STATUS: 'Menús',

  // ÓRDENES DE ENTRADA
  CREATE_ORDER_IN: 'Órdenes de entrada',
  ORDER_IN_LIST_ALL: 'Órdenes de entrada',

  // ÓRDENES DE COMPRA
  PURCHASE_LIST_ALL: 'Órdenes de compra',
  PURCHASE_CHANGE_STATUS: 'Órdenes de compra',

  // DONACIONES
  DONATION_LIST_ALL: 'Donaciones',
  DONATION_CHANGE_STATUS: 'Donaciones',

  // TIPOS DE BENEFICIARIO
  BENEFICIARY_TYPE_CREATE: 'Tipos de beneficiario',
  BENEFICIARY_TYPE_EDIT: 'Tipos de beneficiario',
  BENEFICIARY_TYPE_CHANGE_STATUS: 'Tipos de beneficiario',
  BENEFICIARY_TYPE_LIST_BY_STATUS: 'Tipos de beneficiario',

  // DASHBOARD / REPORTES
  DASHBOARD_VIEW: 'Reportes',

  // CONFIGURACIÓN
  EMPRESA_CONFIG_VIEW: 'Configuración de empresa',
  EMPRESA_CONFIG_EDIT: 'Configuración de empresa',
};
