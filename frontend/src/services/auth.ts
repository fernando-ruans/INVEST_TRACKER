import axios, { AxiosResponse } from 'axios';
import { api } from './api';
import {
  User,
  UserRegister,
  UserLogin,
  UserUpdate,
  UserPasswordUpdate,
  AuthToken,
  PasswordResetRequest,
  PasswordResetConfirm,
  VerificationRequest
} from '../types';

// Token storage keys
const ACCESS_TOKEN_KEY = 'invest_tracker_access_token';
const TOKEN_TYPE_KEY = 'invest_tracker_token_type';

// Serviço de autenticação
export const authService = {
  // Registrar um novo usuário
  async register(userData: UserRegister): Promise<User> {
    const response: AxiosResponse<User> = await api.post('/auth/register', userData);
    return response.data;
  },

  // Login de usuário
  async login(credentials: UserLogin): Promise<AuthToken> {
    const response: AxiosResponse<any> = await api.post('/auth/login', credentials);
    
    // O backend retorna access_token e token_type dentro de data, mas o frontend espera accessToken e tokenType
    const authToken: AuthToken = {
      accessToken: response.data.data.access_token,
      tokenType: response.data.data.token_type
    };
    
    // Salvar token no localStorage
    localStorage.setItem(ACCESS_TOKEN_KEY, authToken.accessToken);
    localStorage.setItem(TOKEN_TYPE_KEY, authToken.tokenType);
    
    // Configurar o token no header padrão do axios
    api.defaults.headers.common['Authorization'] = `${authToken.tokenType} ${authToken.accessToken}`;
    
    return authToken;
  },

  // Logout de usuário
  logout(): void {
    localStorage.removeItem(ACCESS_TOKEN_KEY);
    localStorage.removeItem(TOKEN_TYPE_KEY);
    delete api.defaults.headers.common['Authorization'];
  },

  // Verificar se o usuário está autenticado
  isAuthenticated(): boolean {
    return !!localStorage.getItem(ACCESS_TOKEN_KEY);
  },

  // Obter token de acesso
  getAccessToken(): string | null {
    return localStorage.getItem(ACCESS_TOKEN_KEY);
  },

  // Obter tipo de token
  getTokenType(): string | null {
    return localStorage.getItem(TOKEN_TYPE_KEY);
  },

  // Configurar token de autenticação (usado ao inicializar a aplicação)
  setupToken(): void {
    const token = this.getAccessToken();
    const tokenType = this.getTokenType();
    
    if (token && tokenType) {
      api.defaults.headers.common['Authorization'] = `${tokenType} ${token}`;
    }
  },

  // Obter dados do usuário atual
  async getCurrentUser(): Promise<User> {
    const response: AxiosResponse<any> = await api.get('/auth/me');
    return response.data.data;
  },

  // Atualizar dados do usuário
  async updateUser(userData: UserUpdate): Promise<User> {
    const response: AxiosResponse<any> = await api.put('/auth/profile', userData);
    return response.data.data;
  },

  // Upload de avatar do usuário
  async uploadAvatar(file: File): Promise<User> {
    const formData = new FormData();
    formData.append('avatar', file);
    
    const response: AxiosResponse<any> = await api.post('/auth/avatar', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data.data;
  },

  // Remover avatar do usuário
  async removeAvatar(): Promise<User> {
    const response: AxiosResponse<any> = await api.delete('/auth/avatar');
    return response.data.data;
  },

  // Atualizar senha do usuário
  async updatePassword(passwordData: UserPasswordUpdate): Promise<{ message: string }> {
    const response: AxiosResponse<any> = await api.put('/auth/password', passwordData);
    return response.data;
  },

  // Solicitar redefinição de senha
  async requestPasswordReset(data: PasswordResetRequest): Promise<{ message: string }> {
    const response: AxiosResponse<{ message: string }> = await api.post('/auth/forgot-password', data);
    return response.data;
  },

  // Confirmar redefinição de senha
  async confirmPasswordReset(data: PasswordResetConfirm): Promise<{ message: string }> {
    const response: AxiosResponse<{ message: string }> = await api.post('/auth/reset-password', data);
    return response.data;
  },

  // Verificar email
  async verifyEmail(data: VerificationRequest): Promise<{ message: string }> {
    const response: AxiosResponse<{ message: string }> = await api.post('/auth/verify-email', data);
    return response.data;
  }
};

// Configurar interceptor para lidar com erros de autenticação
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response && error.response.status === 401) {
      // Se receber um erro 401 (não autorizado), fazer logout
      authService.logout();
      // Redirecionar para a página de login
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

// Configurar token ao importar o serviço
authService.setupToken();