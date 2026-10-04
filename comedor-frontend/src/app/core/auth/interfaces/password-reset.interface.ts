export interface ForgotPasswordRequest {
  dni: string;
  phone: string;
}

export interface ValidateTokenResponse {
  valid: boolean;
  message?: string;
}

export interface ResetPasswordRequest {
  token: string;
  newPassword: string;
}

export interface GenericAuthResponse {
  message: string;
}
