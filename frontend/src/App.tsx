import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { BarChart3, PieChart, Newspaper, Calendar, Search, Settings, Menu, X } from 'lucide-react';
import Dashboard from './components/Dashboard';
import Portfolio from './components/Portfolio';
import News from './components/News';
import AssetCard from './components/AssetCard';
import AssetSearch from './components/AssetSearch';
import SearchPage from './components/SearchPage';
import CalendarPage from './components/CalendarPage';
import LoginPage from './components/LoginPage';
import RegisterPage from './components/RegisterPage';
import ProfilePage from './components/ProfilePage';
import ThemeToggle from './components/ThemeToggle';
import { ThemeProvider } from './contexts/ThemeContext';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import { authService } from './services';
import { AssetSearchResult } from './types';

// Configurar token na inicialização
authService.setupToken();

// Componente para rotas protegidas
const ProtectedRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { isAuthenticated, isLoading } = useAuth();

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-100 dark:bg-gray-900">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  return <>{children}</>;
};

// Componente principal da aplicação autenticada
const AuthenticatedApp: React.FC = () => {
  const [sidebarOpen, setSidebarOpen] = React.useState(false);
  const [selectedAsset, setSelectedAsset] = React.useState<string | null>(null);
  const { user, logout } = useAuth();

  const navigation = [
    { name: 'Dashboard', href: '/', icon: BarChart3, current: true },
    { name: 'Portfolio', href: '/portfolio', icon: PieChart, current: false },
    { name: 'Notícias', href: '/news', icon: Newspaper, current: false },
    { name: 'Calendário', href: '/calendar', icon: Calendar, current: false },
    { name: 'Buscar Ativos', href: '/search', icon: Search, current: false },
    { name: 'Perfil', href: '/profile', icon: Settings, current: false },
  ];

  const handleLogout = () => {
    logout();
  };

  const handleAssetSelect = (asset: AssetSearchResult) => {
    setSelectedAsset(asset.symbol);
  };

  return (
    <div className="h-screen flex overflow-hidden bg-gray-100 dark:bg-gray-900">
        {/* Sidebar para mobile */}
        <div className={`fixed inset-0 flex z-40 lg:hidden ${sidebarOpen ? '' : 'hidden'}`}>
          <div className="fixed inset-0 bg-gray-600 bg-opacity-75" onClick={() => setSidebarOpen(false)} />
          <div className="relative flex-1 flex flex-col max-w-xs w-full bg-white dark:bg-gray-800 shadow-xl">
            <div className="absolute top-0 right-0 -mr-12 pt-2">
              <button
                className="ml-1 flex items-center justify-center h-10 w-10 rounded-full focus:outline-none focus:ring-2 focus:ring-inset focus:ring-white hover:bg-gray-600 transition-colors"
                onClick={() => setSidebarOpen(false)}
              >
                <X className="h-6 w-6 text-white" />
              </button>
            </div>
            <SidebarContent navigation={navigation} user={user} onLogout={handleLogout} />
          </div>
        </div>

        {/* Sidebar para desktop */}
        <div className="hidden lg:flex lg:flex-shrink-0">
          <div className="flex flex-col w-64 border-r border-gray-200 dark:border-gray-700">
            <SidebarContent navigation={navigation} user={user} onLogout={handleLogout} />
          </div>
        </div>

        {/* Conteúdo principal */}
        <div className="flex flex-col w-0 flex-1 overflow-hidden">
          {/* Header mobile */}
          <div className="lg:hidden">
            <div className="relative z-10 flex-shrink-0 flex h-16 bg-white dark:bg-gray-800 shadow">
              <button
                className="px-4 border-r border-gray-200 dark:border-gray-700 text-gray-500 dark:text-gray-400 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-primary-500 lg:hidden"
                onClick={() => setSidebarOpen(true)}
                aria-label="Abrir menu"
              >
                <Menu className="h-6 w-6" />
              </button>
              <div className="flex-1 px-2 sm:px-4 flex justify-between items-center">
                <div className="flex-shrink-0 flex items-center">
                  <img src="/logo.png" alt="InvestTracker" className="h-8 w-auto" />
                </div>
                <div className="flex items-center space-x-2">
                  <ThemeToggle />
                  <button
                    onClick={handleLogout}
                    className="p-2 rounded-md text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-primary-500"
                    aria-label="Sair"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                    </svg>
                  </button>
                </div>
              </div>
            </div>
          </div>

          <main className="flex-1 relative overflow-y-auto focus:outline-none pb-safe">
            <Routes>
              <Route path="/" element={<Dashboard />} />
              <Route path="/portfolio" element={<Portfolio />} />
              <Route path="/news" element={<News />} />
              <Route 
                path="/search" 
                element={<SearchPage />} 
              />
              <Route path="/calendar" element={<CalendarPage />} />
              <Route path="/profile" element={<ProfilePage />} />
              <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
          </main>
        </div>
        </div>
  );
};

// Componente do conteúdo da sidebar
const SidebarContent: React.FC<{ 
  navigation: any[]; 
  user: any; 
  onLogout: () => void; 
}> = ({ navigation, user, onLogout }) => {
  return (
    <div className="flex flex-col h-0 flex-1 bg-white dark:bg-gray-800">
      <div className="flex-1 flex flex-col pt-3 sm:pt-5 pb-4 overflow-y-auto">
        <div className="flex items-center justify-center flex-shrink-0 px-4 mb-2 sm:mb-4">
          <img src="/logo.png" alt="InvestTracker" className="h-16 sm:h-24 lg:h-32 w-auto" />
        </div>
        <nav className="mt-5 flex-1 px-2 bg-white dark:bg-gray-800 space-y-1">
          {navigation.map((item) => {
            const Icon = item.icon;
            return (
              <a
                key={item.name}
                href={item.href}
                className={`group flex items-center px-2 py-2 text-sm font-medium rounded-md ${
                  window.location.pathname === item.href
                    ? 'bg-primary-100 dark:bg-primary-900 text-primary-900 dark:text-primary-100'
                    : 'text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 hover:text-gray-900 dark:hover:text-white'
                }`}
              >
                <Icon
                  className={`mr-3 flex-shrink-0 h-6 w-6 ${
                    window.location.pathname === item.href
                      ? 'text-primary-500 dark:text-primary-400'
                      : 'text-gray-400 dark:text-gray-500 group-hover:text-gray-500 dark:group-hover:text-gray-400'
                  }`}
                />
                {item.name}
              </a>
            );
          })}
        </nav>
      </div>
      <div className="flex-shrink-0 flex border-t border-gray-200 dark:border-gray-700 p-4">
        <div className="flex items-center justify-between w-full">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              {user?.avatar ? (
                <img 
                  src={user.avatar?.startsWith('http') ? user.avatar : `http://localhost:8000/uploads/avatars/${user.avatar.split('/').pop()}`} 
                  alt="Avatar do usuário" 
                  className="h-8 w-8 rounded-full object-cover border-2 border-primary-500"
                />
              ) : (
                <div className="h-8 w-8 rounded-full bg-primary-500 flex items-center justify-center">
                  <span className="text-sm font-medium text-white">
                    {user?.fullName ? user.fullName.charAt(0).toUpperCase() : user?.username?.charAt(0).toUpperCase() || 'U'}
                  </span>
                </div>
              )}
            </div>
            <div className="ml-3 flex-1">
              <p className="text-sm font-medium text-gray-700 dark:text-gray-300">
                {user?.fullName || user?.username || 'Usuário'}
              </p>
              <button
                onClick={onLogout}
                className="text-xs text-red-500 hover:text-red-700 dark:text-red-400 dark:hover:text-red-300"
              >
                Sair
              </button>
            </div>
          </div>
          <ThemeToggle />
        </div>
      </div>
    </div>
  );
};



// Componente App principal
const App: React.FC = () => {
  return (
    <ThemeProvider>
      <Router
        future={{
          v7_startTransition: true,
          v7_relativeSplatPath: true,
        }}
      >
        <AuthProvider>
          <Routes>
            {/* Rotas públicas */}
            <Route path="/login" element={<LoginPage />} />
            <Route path="/register" element={<RegisterPage />} />
            
            {/* Rotas protegidas */}
            <Route path="/*" element={
              <ProtectedRoute>
                <AuthenticatedApp />
              </ProtectedRoute>
            } />
          </Routes>
        </AuthProvider>
      </Router>
    </ThemeProvider>
  );
};

export default App;