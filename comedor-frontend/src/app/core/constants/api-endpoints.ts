export const API_ENDPOINTS = {
  AUTH: {
    LOGIN: '/auth/login',
    LOGOUT: '/auth/logout',
    REFRESH: '/auth/refresh',
  },

  BENEFICIARY: {
    CREATE: '/beneficiary/create',

    SEARCH_BY_DNI_RENIEC: '/beneficiary/reniec/{dni}',

    SEARCH_BY_DNI: '/beneficiary/{dni}',

    CREATE_BY_DNI: '/beneficiary/reniec/{dni}',

    EDIT: '/beneficiary/edit/{id}',

    LIST_BY_STATUS: '/beneficiary/list',
  },

  CATEGORY: {
    LIST_BY_STATUS: '/category/list',

    CREATE: '/category/create',

    CHANGE_STATUS: '/category/changeStatus/{id}',
  },

  MENU_REPORT: {
    CREATE: '/menu-report/create',

    GET_BY_DATE: '/menu-report/date/{fecha}',

    GET_SUMMARY: '/menu-report/{id}/summary',
  },

  MENU_RECORD: {
    ADD_PRODUCT: '/menu-report/{id}/records',

    EDIT_PRODUCT: '/menu-report/{reporteId}/records/{registroId}',

    REMOVE_PRODUCT: '/menu-report/{reporteId}/records/{registroId}',

    ADD_BENEFICIARY: '/menu-report/{id}/beneficiaries',

    EDIT_BENEFICIARY: '/menu-report/{reporteId}/beneficiaries/{controlId}',

    REMOVE_BENEFICIARY: '/menu-report/{reporteId}/beneficiaries/{controlId}',
  },

  PRODUCT: {
    LIST_BY_STATUS: '/product/list',

    CREATE: '/product/create',

    EDIT: '/product/edit/{id}',

    CHANGE_STATUS: '/product/changeStatus/{id}',

    ALERT: '/alerts/stock-min',
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
  },

  ROLE: {
    CREATE: '/roles',

    EDIT: '/roles/{id}',

    LIST_BY_STATUS: '/roles',

    GET_BY_ID: '/roles/{id}',
  },

  MODIFICATION: {
    LIST_ALL: '/modifications/list',
  },

  PERMISSION: {
    LIST_ALL: '/permissions/all',
  },
};
