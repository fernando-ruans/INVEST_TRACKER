// Interfaces para autenticação e usuários

export interface User {
  id: number;
  email: string;
  username: string;
  fullName?: string;
  isActive: boolean;
  isVerified: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface UserRegister {
  email: string;
  username: string;
  fullName?: string;
  password: string;
}

export interface UserLogin {
  username: string;
  password: string;
}

export interface UserUpdate {
  email?: string;
  username?: string;
  fullName?: string;
}

export interface UserPasswordUpdate {
  currentPassword: string;
  newPassword: string;
}

export interface AuthToken {
  accessToken: string;
  tokenType: string;
}

export interface PasswordResetRequest {
  email: string;
}

export interface PasswordResetConfirm {
  resetCode: string;
  newPassword: string;
}

export interface VerificationRequest {
  verificationCode: string;
}