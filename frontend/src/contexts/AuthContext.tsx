import React, { createContext, useState, useEffect, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import { authService } from '../services';
import { User } from '../types';

interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (username: string, password: string) => Promise<void>;
  logout: () => void;
  register: (email: string, username: string, password: string, fullName?: string) => Promise<void>;
  updateUser: (data: { email?: string; username?: string; fullName?: string; avatar?: string }) => Promise<void>;
  updatePassword: (currentPassword: string, newPassword: string) => Promise<void>;
  uploadAvatar: (file: File) => Promise<void>;
  removeAvatar: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const navigate = useNavigate();

  // Verificar se o usuário está autenticado ao carregar a aplicação
  useEffect(() => {
    const checkAuth = async () => {
      if (authService.isAuthenticated()) {
        try {
          const userData = await authService.getCurrentUser();
          setUser(userData);
        } catch (error) {
          console.error('Erro ao obter dados do usuário:', error);
          authService.logout();
        }
      }
      setIsLoading(false);
    };

    checkAuth();
  }, []);

  // Função de login
  const login = async (username: string, password: string) => {
    setIsLoading(true);
    try {
      await authService.login({ username, password });
      const userData = await authService.getCurrentUser();
      setUser(userData);
      navigate('/');
    } catch (error) {
      console.error('Erro ao fazer login:', error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  // Função de logout
  const logout = () => {
    authService.logout();
    setUser(null);
    navigate('/login');
  };

  // Função de registro
  const register = async (email: string, username: string, password: string, fullName?: string) => {
    setIsLoading(true);
    try {
      await authService.register({ email, username, password, fullName });
      navigate('/login');
    } catch (error) {
      console.error('Erro ao registrar usuário:', error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  // Função para atualizar dados do usuário
  const updateUser = async (data: { email?: string; username?: string; fullName?: string; avatar?: string }) => {
    setIsLoading(true);
    try {
      const updatedUser = await authService.updateUser(data);
      setUser(updatedUser);
    } catch (error) {
      console.error('Erro ao atualizar usuário:', error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  // Função para upload de avatar
  const uploadAvatar = async (file: File) => {
    setIsLoading(true);
    try {
      const updatedUser = await authService.uploadAvatar(file);
      setUser(updatedUser);
    } catch (error) {
      console.error('Erro ao fazer upload do avatar:', error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  // Função para remover avatar
  const removeAvatar = async () => {
    setIsLoading(true);
    try {
      const updatedUser = await authService.removeAvatar();
      setUser(updatedUser);
    } catch (error) {
      console.error('Erro ao remover avatar:', error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  // Função para atualizar senha
  const updatePassword = async (currentPassword: string, newPassword: string) => {
    setIsLoading(true);
    try {
      await authService.updatePassword({ currentPassword, newPassword });
    } catch (error) {
      console.error('Erro ao atualizar senha:', error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        isAuthenticated: !!user,
        isLoading,
        login,
        logout,
        register,
        updateUser,
        updatePassword,
        uploadAvatar,
        removeAvatar,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

// Hook personalizado para usar o contexto de autenticação
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth deve ser usado dentro de um AuthProvider');
  }
  return context;
};