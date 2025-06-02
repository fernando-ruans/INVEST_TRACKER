import React, { useState, useEffect } from 'react';
import { Newspaper, ExternalLink, Clock, Filter, Search, RefreshCw } from 'lucide-react';
import { newsService } from '../services/api';
import { NewsItem, NewsFilter } from '../types';

const News: React.FC = () => {
  const [news, setNews] = useState<NewsItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [refreshing, setRefreshing] = useState(false);

  const categories = [
    { id: 'all', name: 'Todas as Notícias', icon: '📰' },
    { id: 'financial', name: 'Financeiro', icon: '💰' },
    { id: 'stocks', name: 'Ações', icon: '📈' },
    { id: 'crypto', name: 'Crypto', icon: '₿' },
    { id: 'forex', name: 'Forex', icon: '💱' },
    { id: 'commodities', name: 'Commodities', icon: '🛢️' },
    { id: 'economy', name: 'Economia', icon: '🏭' }
  ];

  useEffect(() => {
    loadNews();
  }, []);

  const loadNews = async () => {
    try {
      setLoading(true);
      const data = await newsService.getFinancialNews();
      setNews(data);
    } catch (error) {
      console.error('Erro ao carregar notícias:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleRefresh = async () => {
    try {
      setRefreshing(true);
      await loadNews();
    } finally {
      setRefreshing(false);
    }
  };

  const handleSearch = async () => {
    if (!searchTerm.trim()) {
      loadNews();
      return;
    }

    try {
      setLoading(true);
      const data = await newsService.searchNews(searchTerm);
      setNews(data);
    } catch (error) {
      console.error('Erro ao buscar notícias:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleCategoryChange = async (category: string) => {
    setSelectedCategory(category);
    
    // Se não temos notícias carregadas, carregamos todas
    if (news.length === 0) {
      await loadNews();
    }
    
    // O filtro será aplicado automaticamente no render através do .filter()
  };

  const formatDate = (dateString: string): string => {
    try {
      const date = new Date(dateString);
      
      // Verificar se a data é válida
      if (isNaN(date.getTime())) {
        return 'Data inválida';
      }
      
      const now = new Date();
      const diffInMs = now.getTime() - date.getTime();
      const diffInMinutes = Math.floor(diffInMs / (1000 * 60));
      const diffInHours = Math.floor(diffInMs / (1000 * 60 * 60));
      const diffInDays = Math.floor(diffInMs / (1000 * 60 * 60 * 24));
      
      if (diffInMinutes < 1) {
        return 'Agora mesmo';
      } else if (diffInMinutes < 60) {
        return `${diffInMinutes} min atrás`;
      } else if (diffInHours < 24) {
        return `${diffInHours}h atrás`;
      } else if (diffInDays < 7) {
        return `${diffInDays} dia${diffInDays > 1 ? 's' : ''} atrás`;
      } else {
        // Para datas mais antigas, mostrar a data formatada
        return date.toLocaleDateString('pt-BR', {
          day: '2-digit',
          month: '2-digit',
          year: 'numeric'
        });
      }
    } catch (error) {
      console.error('Erro ao formatar data:', error, 'Data original:', dateString);
      return 'Data inválida';
    }
  };

  const truncateText = (text: string, maxLength: number) => {
    if (text.length <= maxLength) return text;
    return text.substring(0, maxLength) + '...';
  };

  if (loading && news.length === 0) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Notícias Financeiras</h1>
              <p className="mt-2 text-gray-600">
                Mantenha-se atualizado com as últimas notícias do mercado financeiro.
              </p>
            </div>
            <button
              onClick={handleRefresh}
              disabled={refreshing}
              className="btn-primary"
            >
              <RefreshCw className={`h-5 w-5 mr-2 ${refreshing ? 'animate-spin' : ''}`} />
              Atualizar
            </button>
          </div>
        </div>

        {/* Filtros e Busca */}
        <div className="mb-8 space-y-4">
          {/* Barra de Busca */}
          <div className="flex space-x-4">
            <div className="flex-1 relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Search className="h-5 w-5 text-gray-400" />
              </div>
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
                className="input pl-10"
                placeholder="Buscar notícias..."
              />
            </div>
            <button
              onClick={handleSearch}
              className="btn-primary"
            >
              Buscar
            </button>
          </div>

          {/* Filtros de Categoria */}
          <div className="flex space-x-2 overflow-x-auto pb-2">
            {categories.map((category) => (
              <button
                key={category.id}
                onClick={() => setSelectedCategory(category.id)}
                className={`flex-shrink-0 px-4 py-2 rounded-lg font-medium transition-colors flex items-center gap-2 ${
                  selectedCategory === category.id
                    ? 'bg-primary-600 text-white'
                    : 'bg-white text-gray-700 hover:bg-gray-50 border border-gray-200'
                }`}
              >
                <span>{category.icon}</span>
                {category.name}
              </button>
            ))}
          </div>
        </div>

        {/* Lista de Notícias */}
        {news.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {news
              .filter(article => {
                if (selectedCategory === 'all') return true;
                return article.category === selectedCategory;
              })
              .map((article, index) => (
                <NewsCard key={index} article={article} formatDate={formatDate} truncateText={truncateText} />
              ))}
          </div>
        ) : (
          <div className="text-center py-12">
            <Newspaper className="mx-auto h-12 w-12 text-gray-400" />
            <h3 className="mt-2 text-sm font-medium text-gray-900">Nenhuma notícia encontrada</h3>
            <p className="mt-1 text-sm text-gray-500">
              {searchTerm 
                ? 'Tente buscar com outros termos.' 
                : selectedCategory !== 'all' 
                  ? 'Não há notícias disponíveis para esta categoria.' 
                  : 'Não há notícias disponíveis no momento.'
              }
            </p>
            {(searchTerm || selectedCategory !== 'all') && (
              <div className="mt-6">
                <button
                  onClick={() => {
                    setSearchTerm('');
                    setSelectedCategory('all');
                    loadNews();
                  }}
                  className="btn-primary"
                >
                  Ver Todas as Notícias
                </button>
              </div>
            )}
          </div>
        )}

        {loading && news.length > 0 && (
          <div className="flex justify-center mt-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600"></div>
          </div>
        )}
      </div>
    </div>
  );
};

// Componente do Card de Notícia
const NewsCard: React.FC<{
  article: NewsItem;
  formatDate: (date: string) => string;
  truncateText: (text: string, maxLength: number) => string;
}> = ({ article, formatDate, truncateText }) => {
  return (
    <div className="card hover:shadow-card-hover transition-shadow duration-200">
      {/* Imagem da Notícia */}
      {article.imageUrl && (
        <div className="aspect-w-16 aspect-h-9">
          <img
            src={article.imageUrl}
            alt={article.title}
            className="w-full h-48 object-cover rounded-t-lg"
            onError={(e) => {
              const target = e.target as HTMLImageElement;
              target.style.display = 'none';
            }}
          />
        </div>
      )}

      <div className="card-body">
        {/* Categoria e Data */}
        <div className="flex items-center justify-between mb-3">
          {article.category && (
            <span className="badge-primary">
              {article.category}
            </span>
          )}
          <div className="flex items-center text-sm text-gray-500">
            <Clock className="h-4 w-4 mr-1" />
            {formatDate(article.publishedDate)}
          </div>
        </div>

        {/* Título */}
        <h3 className="text-lg font-semibold text-gray-900 mb-2 line-clamp-2">
          {article.title}
        </h3>

        {/* Descrição */}
        {article.description && (
          <p className="text-gray-600 text-sm mb-4 line-clamp-3">
            {truncateText(article.description, 150)}
          </p>
        )}

        {/* Fonte e Link */}
        <div className="flex items-center justify-between">
          <span className="text-sm text-gray-500">
            {article.source}
          </span>
          <a
            href={article.url}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center text-primary-600 hover:text-primary-700 text-sm font-medium"
          >
            Ler mais
            <ExternalLink className="h-4 w-4 ml-1" />
          </a>
        </div>
      </div>
    </div>
  );
};

export default News;