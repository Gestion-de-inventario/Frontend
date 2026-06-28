export interface AuthResponse {
  id: number;

  lastname: string;

  dni: string;

  name: string;

  permissions: string[];

  role: string;

  token: string;

  passwordChanged: boolean;
}
