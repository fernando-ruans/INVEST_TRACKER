import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { Eye, EyeOff, LogIn, TrendingUp, PieChart, BarChart3, Globe, Shield, Mail, Lock } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';

const LoginPage: React.FC = () => {
  const [formData, setFormData] = useState({
    username: '',
    password: ''
  });
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  
  const { login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  
  const from = location.state?.from?.pathname || '/';

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    // Limpar erro quando o usuário começar a digitar
    if (error) setError('');
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');

    try {
      await login(formData.username, formData.password);
      navigate(from, { replace: true });
    } catch (err: any) {
      setError(err.message || 'Erro ao fazer login');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex bg-gray-50 dark:bg-gray-900">
      {/* Seção de informações sobre o app */}
      <div className="hidden lg:flex lg:w-1/2 bg-gradient-to-br from-primary-600 to-primary-800 dark:from-primary-700 dark:to-primary-900 relative overflow-hidden">
        <div className="absolute inset-0 bg-black opacity-20"></div>
        <div className="relative z-10 flex flex-col justify-center px-12 py-16 text-white">
          {/* Logo */}
          <div className="flex items-center mb-8">
            <div className="h-12 w-12 bg-white rounded-lg flex items-center justify-center mr-4">
              <TrendingUp className="h-8 w-8 text-primary-600" />
            </div>
            <div>
              <h1 className="text-2xl font-bold">InvestTracker</h1>
              <p className="text-primary-100 text-sm">Sua plataforma de investimentos</p>
            </div>
          </div>

          {/* Título principal */}
          <h2 className="text-4xl font-bold mb-6 leading-tight">
            Gerencie seus investimentos
            <br />
            <span className="text-primary-200">de forma inteligente</span>
          </h2>

          <p className="text-xl text-primary-100 mb-12 leading-relaxed">
            Acompanhe seu portfólio, analise tendências do mercado e tome decisões informadas com nossa plataforma completa de investimentos.
          </p>

          {/* Features */}
          <div className="space-y-6">
            <div className="flex items-center">
              <div className="h-10 w-10 bg-primary-500 rounded-lg flex items-center justify-center mr-4">
                <PieChart className="h-5 w-5 text-white" />
              </div>
              <div>
                <h3 className="font-semibold">Análise de Portfólio</h3>
                <p className="text-primary-100 text-sm">Visualize a distribuição e performance dos seus investimentos</p>
              </div>
            </div>

            <div className="flex items-center">
              <div className="h-10 w-10 bg-primary-500 rounded-lg flex items-center justify-center mr-4">
                <BarChart3 className="h-5 w-5 text-white" />
              </div>
              <div>
                <h3 className="font-semibold">Relatórios Detalhados</h3>
                <p className="text-primary-100 text-sm">Gráficos e métricas para acompanhar seu progresso</p>
              </div>
            </div>

            <div className="flex items-center">
              <div className="h-10 w-10 bg-primary-500 rounded-lg flex items-center justify-center mr-4">
                <Globe className="h-5 w-5 text-white" />
              </div>
              <div>
                <h3 className="font-semibold">Mercado em Tempo Real</h3>
                <p className="text-primary-100 text-sm">Cotações atualizadas e notícias do mercado financeiro</p>
              </div>
            </div>

            <div className="flex items-center">
              <div className="h-10 w-10 bg-primary-500 rounded-lg flex items-center justify-center mr-4">
                <Shield className="h-5 w-5 text-white" />
              </div>
              <div>
                <h3 className="font-semibold">Segurança Garantida</h3>
                <p className="text-primary-100 text-sm">Seus dados protegidos com criptografia de ponta</p>
              </div>
            </div>
          </div>
        </div>

        {/* Elementos decorativos */}
        <div className="absolute top-0 right-0 w-64 h-64 bg-primary-400 rounded-full opacity-10 transform translate-x-32 -translate-y-32"></div>
        <div className="absolute bottom-0 left-0 w-48 h-48 bg-primary-300 rounded-full opacity-10 transform -translate-x-24 translate-y-24"></div>
      </div>

      {/* Seção de login */}
      <div className="flex-1 flex items-center justify-center px-4 sm:px-6 lg:px-8 py-12">
        <div className="max-w-md w-full space-y-8">
          {/* Logo mobile */}
          <div className="lg:hidden text-center">
            <div className="inline-flex items-center mb-6">
              <div className="h-10 w-10 bg-primary-600 rounded-lg flex items-center justify-center mr-3">
                <TrendingUp className="h-6 w-6 text-white" />
              </div>
              <div className="text-left">
                <h1 className="text-xl font-bold text-gray-900 dark:text-white">InvestTracker</h1>
                <p className="text-gray-600 dark:text-gray-400 text-xs">Sua plataforma de investimentos</p>
              </div>
            </div>
          </div>

          <div>
            <h2 className="text-center text-3xl font-extrabold text-gray-900 dark:text-white">
              Faça login em sua conta
            </h2>
            <p className="mt-2 text-center text-sm text-gray-600 dark:text-gray-400">
              Ou{' '}
              <Link
                to="/register"
                className="font-medium text-primary-600 hover:text-primary-500 dark:text-primary-400 dark:hover:text-primary-300"
              >
                crie uma nova conta
              </Link>
            </p>
          </div>
        
        <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
          <div className="rounded-md shadow-sm -space-y-px">
            <div>
              <label htmlFor="username" className="sr-only">
                Nome de usuário
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Mail className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  id="username"
                  name="username"
                  type="text"
                  required
                  className="appearance-none rounded-none relative block w-full px-3 py-2 pl-10 border border-gray-300 dark:border-gray-600 placeholder-gray-500 dark:placeholder-gray-400 text-gray-900 dark:text-white bg-white dark:bg-gray-800 rounded-t-md focus:outline-none focus:ring-primary-500 focus:border-primary-500 focus:z-10 sm:text-sm"
                  placeholder="Nome de usuário"
                  value={formData.username}
                  onChange={handleChange}
                />
              </div>
            </div>
            <div>
              <label htmlFor="password" className="sr-only">
                Senha
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Lock className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  id="password"
                  name="password"
                  type={showPassword ? 'text' : 'password'}
                  required
                  className="appearance-none rounded-none relative block w-full px-3 py-2 pl-10 pr-10 border border-gray-300 dark:border-gray-600 placeholder-gray-500 dark:placeholder-gray-400 text-gray-900 dark:text-white bg-white dark:bg-gray-800 rounded-b-md focus:outline-none focus:ring-primary-500 focus:border-primary-500 focus:z-10 sm:text-sm"
                  placeholder="Senha"
                  value={formData.password}
                  onChange={handleChange}
                />
                <div className="absolute inset-y-0 right-0 pr-3 flex items-center">
                  <button
                    type="button"
                    className="text-gray-400 hover:text-gray-500 dark:hover:text-gray-300"
                    onClick={() => setShowPassword(!showPassword)}
                  >
                    {showPassword ? (
                      <EyeOff className="h-5 w-5" />
                    ) : (
                      <Eye className="h-5 w-5" />
                    )}
                  </button>
                </div>
              </div>
            </div>
          </div>

          {error && (
            <div className="rounded-md bg-red-50 dark:bg-red-900 p-4">
              <div className="text-sm text-red-700 dark:text-red-200">
                {error}
              </div>
            </div>
          )}

          <div className="flex items-center justify-between">
            <Link
              to="/forgot-password"
              className="text-sm text-primary-600 hover:text-primary-500 dark:text-primary-400 dark:hover:text-primary-300"
            >
              Esqueceu sua senha?
            </Link>
          </div>

          <div>
            <button
              type="submit"
              disabled={isLoading}
              className="group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 disabled:opacity-50 disabled:cursor-not-allowed dark:bg-primary-700 dark:hover:bg-primary-600"
            >
              {isLoading ? (
                <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
              ) : (
                'Entrar'
              )}
            </button>
          </div>
        </form>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;