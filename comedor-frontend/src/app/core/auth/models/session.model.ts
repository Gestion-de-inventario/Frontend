export interface SessionModel {
  fullname: string;

  permissions: string[];

  token: string;

  isAuthenticated: boolean;
}
