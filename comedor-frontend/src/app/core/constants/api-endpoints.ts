export const API_ENDPOINTS = {
  AUTH: {
    LOGIN: '/auth/login',
    LOGOUT: '/auth/logout',
    REFRESH: '/auth/refresh',
    ME: '/auth/me',
  },

  BENEFICIARY: {
    CREATE: '/beneficiary/create',
    SEARCH_BY_DNI_RENIEC: '/beneficiary/reniec/{dni}',
    SEARCH_BY_DNI: '/beneficiary/{dni}',
    CREATE_BY_DNI: '/beneficiary/reniec/{dni}',
    EDIT: '/beneficiary/edit/{id}',
    LIST_BY_STATUS: '/beneficiary/list',
    CHANGE_STATUS: '/beneficiary/changeStatus/{id}',
  },

  BENEFICIARY_TYPE: {
    EDIT: '/beneficiary/type/edit/{id}',
    CHANGE_STATUS: '/beneficiary/type/changeStatus/{id}',
    LIST_BY_STATUS: '/beneficiary/type/list',
    CREATE: '/beneficiary/type/create',
  },

  CATEGORY: {
    LIST_BY_STATUS: '/category/list',
    CREATE: '/category/create',
    CHANGE_STATUS: '/category/changeStatus/{id}',
  },

  DISH_MENU: {
    LIST_ALL: '/dish-menus',
    CREATE: '/dish-menus/create',
    EDIT: '/dish-menus/{id}',
    CHANGE_STATUS: '/dish-menus/{id}/changeStatus',
  },

  MENU_REPORT: {
    CREATE: '/menu_report/create',
    GET_BY_DATE: '/menu_report/date/{fecha}',
    GET_SUMMARY: '/menu_report/{id}/summary',
    ADD_BENEFICIARY: '/menu_report/{id}/beneficiaries',
    EDIT_BENEFICIARY: '/menu_report/{reporteId}/beneficiaries/{controlId}',
    REMOVE_BENEFICIARY: '/menu_report/{reporteId}/beneficiaries/{controlId}',
  },

  PRODUCT: {
    LIST_BY_STATUS: '/product/list',
    CREATE: '/product/create',
    EDIT: '/product/edit/{id}',
    CHANGE_STATUS: '/product/changeStatus/{id}',
  },

  TAG: {
    LIST_BY_STATUS: '/tag/list',
    CREATE: '/tag/create',
    CHANGE_STATUS: '/tag/changeStatus/{id}',
  },

  TRANSACTION: {
    LIST_ALL: '/transactions',
  },

  USER: {
    LIST_ALL: '/user/all',
    LIST_ACTIVE: '/user/actived',
    CREATE: '/user/register',
    EDIT: '/user/edit/{id}',
    ACTIVATE: '/user/activate/{id}',
    DEACTIVATE: '/user/deactivate/{id}',
    CHANGE_PASSWORD: '/user/change-password/{id}',
  },

  ROLE: {
    CREATE: '/roles',
    LIST_BY_STATUS: '/roles',
    EDIT: '/roles/edit/{id}',
    CHANGE_STATUS: '/roles/changeStatus/{id}',
    ASSIGN_PERMISSIONS: '/roles/assignPermissions/{id}',
    GET_BY_ID: '/roles/{id}',
  },

  MODIFICATION: {
    LIST_ALL: '/modifications',
  },

  PERMISSION: {
    LIST_ALL: '/permissions/all',
  },

  ALERT: {
    STOCK_MIN: '/alerts/stock-min',
  },

  PURCHASE: {
    CHANGE_STATUS: '/{id}/confirm',
  },

  DASHBOARD: {
    GET_SUMMARY: '/dashboard',
  },

};
