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
import ThemeToggle from './components/ThemeToggle';
import { ThemeProvider } from './contexts/ThemeContext';
import { AssetSearchResult } from './types';

const App: React.FC = () => {
  const [sidebarOpen, setSidebarOpen] = React.useState(false);
  const [selectedAsset, setSelectedAsset] = React.useState<string | null>(null);

  const navigation = [
    { name: 'Dashboard', href: '/', icon: BarChart3, current: true },
    { name: 'Portfolio', href: '/portfolio', icon: PieChart, current: false },
    { name: 'Notícias', href: '/news', icon: Newspaper, current: false },
    { name: 'Calendário', href: '/calendar', icon: Calendar, current: false },
    { name: 'Buscar Ativos', href: '/search', icon: Search, current: false },
  ];

  const handleAssetSelect = (asset: AssetSearchResult) => {
    setSelectedAsset(asset.symbol);
  };

  return (
    <ThemeProvider>
      <Router
        future={{
          v7_startTransition: true,
          v7_relativeSplatPath: true,
        }}
      >
        <div className="h-screen flex overflow-hidden bg-gray-100 dark:bg-gray-900">
        {/* Sidebar para mobile */}
        <div className={`fixed inset-0 flex z-40 md:hidden ${sidebarOpen ? '' : 'hidden'}`}>
          <div className="fixed inset-0 bg-gray-600 bg-opacity-75" onClick={() => setSidebarOpen(false)} />
          <div className="relative flex-1 flex flex-col max-w-xs w-full bg-white dark:bg-gray-800">
            <div className="absolute top-0 right-0 -mr-12 pt-2">
              <button
                className="ml-1 flex items-center justify-center h-10 w-10 rounded-full focus:outline-none focus:ring-2 focus:ring-inset focus:ring-white"
                onClick={() => setSidebarOpen(false)}
              >
                <X className="h-6 w-6 text-white" />
              </button>
            </div>
            <SidebarContent navigation={navigation} />
          </div>
        </div>

        {/* Sidebar para desktop */}
        <div className="hidden md:flex md:flex-shrink-0">
          <div className="flex flex-col w-64">
            <SidebarContent navigation={navigation} />
          </div>
        </div>

        {/* Conteúdo principal */}
        <div className="flex flex-col w-0 flex-1 overflow-hidden">
          {/* Header mobile */}
          <div className="md:hidden">
            <div className="relative z-10 flex-shrink-0 flex h-16 bg-white dark:bg-gray-800 shadow">
              <button
                className="px-4 border-r border-gray-200 dark:border-gray-700 text-gray-500 dark:text-gray-400 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-primary-500 md:hidden"
                onClick={() => setSidebarOpen(true)}
              >
                <Menu className="h-6 w-6" />
              </button>
              <div className="flex-1 px-4 flex justify-between">
                <div className="flex-1 flex">
                  <div className="w-full flex md:ml-0">
                    <div className="relative w-full text-gray-400 focus-within:text-gray-600">
                      <div className="absolute inset-y-0 left-0 flex items-center pointer-events-none">
                        <Search className="h-5 w-5" />
                      </div>
                      <AssetSearch
                        onAssetSelect={handleAssetSelect}
                        className="w-full"
                        placeholder="Buscar ativos..."
                      />
                    </div>
                  </div>
                </div>
                <div className="ml-4 flex items-center">
                  <ThemeToggle />
                </div>
              </div>
            </div>
          </div>

          {/* Área de conteúdo */}
          <main className="flex-1 relative overflow-y-auto focus:outline-none">
            <Routes>
              <Route path="/" element={<Dashboard />} />
              <Route path="/portfolio" element={<Portfolio />} />
              <Route path="/news" element={<News />} />
              <Route 
                path="/search" 
                element={<SearchPage />} 
              />
              <Route path="/calendar" element={<CalendarPage />} />
              <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
          </main>
        </div>
        </div>
      </Router>
    </ThemeProvider>
  );
};

// Componente do conteúdo da sidebar
const SidebarContent: React.FC<{ navigation: any[] }> = ({ navigation }) => {
  return (
    <div className="flex flex-col h-0 flex-1 border-r border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800">
      <div className="flex-1 flex flex-col pt-5 pb-4 overflow-y-auto">
        <div className="flex items-center flex-shrink-0 px-4">
          <img src="/logo.png" alt="InvestTracker" className="h-32 w-auto" />
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
              <div className="h-8 w-8 rounded-full bg-primary-500 flex items-center justify-center">
                <span className="text-sm font-medium text-white">U</span>
              </div>
            </div>
            <div className="ml-3">
              <p className="text-sm font-medium text-gray-700 dark:text-gray-300">Usuário</p>
              <p className="text-xs text-gray-500 dark:text-gray-400">Ver perfil</p>
            </div>
          </div>
          <ThemeToggle />
        </div>
      </div>
    </div>
  );
};



export default App;