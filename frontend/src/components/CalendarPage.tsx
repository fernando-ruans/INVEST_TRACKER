import React, { useState, useEffect } from 'react';
import { Calendar, Clock, Globe, AlertCircle, Filter, RefreshCw } from 'lucide-react';
import { calendarService } from '../services/api';
import { EconomicEvent, CalendarFilter } from '../types';

const CalendarPage: React.FC = () => {
  const [events, setEvents] = useState<EconomicEvent[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [selectedDate, setSelectedDate] = useState<string>(new Date().toISOString().split('T')[0]);
  const [selectedCountry, setSelectedCountry] = useState<string>('all');
  const [selectedImportance, setSelectedImportance] = useState<string>('all');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [viewMode, setViewMode] = useState<'today' | 'week' | 'custom'>('today');

  const countries = [
    { value: 'all', label: 'Todos os Países' },
    { value: 'US', label: 'Estados Unidos' },
    { value: 'EU', label: 'União Europeia' },
    { value: 'GB', label: 'Reino Unido' },
    { value: 'JP', label: 'Japão' },
    { value: 'CN', label: 'China' },
    { value: 'BR', label: 'Brasil' },
  ];

  const importanceLevels = [
    { value: 'all', label: 'Todas' },
    { value: 'high', label: 'Alta' },
    { value: 'medium', label: 'Média' },
    { value: 'low', label: 'Baixa' },
  ];

  const categories = [
    { value: 'all', label: 'Todas as Categorias' },
    { value: 'monetary_policy', label: 'Política Monetária' },
    { value: 'employment', label: 'Emprego' },
    { value: 'inflation', label: 'Inflação' },
    { value: 'gdp', label: 'PIB' },
    { value: 'trade', label: 'Comércio' },
    { value: 'manufacturing', label: 'Manufatura' },
    { value: 'consumer', label: 'Consumidor' },
  ];

  useEffect(() => {
    loadEvents();
  }, [viewMode, selectedDate, selectedCountry, selectedImportance, selectedCategory]);

  const loadEvents = async () => {
    try {
      setLoading(true);
      let data: EconomicEvent[];

      const filters: CalendarFilter = {
        country: selectedCountry !== 'all' ? selectedCountry : undefined,
        importance: selectedImportance !== 'all' ? selectedImportance as 'high' | 'medium' | 'low' : undefined,
        category: selectedCategory !== 'all' ? selectedCategory : undefined,
      };

      switch (viewMode) {
        case 'today':
          data = await calendarService.getTodayEvents(filters);
          break;
        case 'week':
          data = await calendarService.getThisWeekEvents(filters);
          break;
        case 'custom':
          data = await calendarService.getEventsByDate(selectedDate, filters);
          break;
        default:
          data = await calendarService.getTodayEvents(filters);
      }

      setEvents(data);
    } catch (error) {
      console.error('Erro ao carregar eventos:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleRefresh = async () => {
    try {
      setRefreshing(true);
      await loadEvents();
    } finally {
      setRefreshing(false);
    }
  };

  const getImportanceColor = (importance: string) => {
    switch (importance) {
      case 'high':
        return 'bg-danger-100 text-danger-800 border-danger-200';
      case 'medium':
        return 'bg-warning-100 text-warning-800 border-warning-200';
      case 'low':
        return 'bg-gray-100 text-gray-800 border-gray-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getImportanceIcon = (importance: string) => {
    switch (importance) {
      case 'high':
        return '🔴';
      case 'medium':
        return '🟡';
      case 'low':
        return '🟢';
      default:
        return '⚪';
    }
  };

  const formatTime = (timeString: string) => {
    return new Date(`2000-01-01T${timeString}`).toLocaleTimeString('pt-BR', {
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('pt-BR', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const groupEventsByDate = (events: EconomicEvent[]) => {
    return events.reduce((groups, event) => {
      const date = event.date;
      if (!groups[date]) {
        groups[date] = [];
      }
      groups[date].push(event);
      return groups;
    }, {} as Record<string, EconomicEvent[]>);
  };

  const groupedEvents = groupEventsByDate(events);

  if (loading && events.length === 0) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Calendário Econômico</h1>
              <p className="mt-2 text-gray-600 dark:text-gray-300">
                Acompanhe os principais eventos econômicos que podem impactar os mercados.
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

        {/* Filters */}
        <div className="mb-8">
          <div className="card dark:bg-gray-800 dark:border-gray-700 p-6">
            <div className="space-y-4">
              {/* View Mode */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Período
                </label>
                <div className="flex space-x-2">
                  {[
                    { value: 'today', label: 'Hoje' },
                    { value: 'week', label: 'Esta Semana' },
                    { value: 'custom', label: 'Data Específica' },
                  ].map((mode) => (
                    <button
                      key={mode.value}
                      onClick={() => setViewMode(mode.value as any)}
                      className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                        viewMode === mode.value
                          ? 'bg-primary-600 text-white'
                          : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
                      }`}
                    >
                      {mode.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Custom Date */}
              {viewMode === 'custom' && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Data
                  </label>
                  <input
                    type="date"
                    value={selectedDate}
                    onChange={(e) => setSelectedDate(e.target.value)}
                    className="input"
                  />
                </div>
              )}

              {/* Filters Row */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    País
                  </label>
                  <select
                    value={selectedCountry}
                    onChange={(e) => setSelectedCountry(e.target.value)}
                    className="input"
                  >
                    {countries.map((country) => (
                      <option key={country.value} value={country.value}>
                        {country.label}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Importância
                  </label>
                  <select
                    value={selectedImportance}
                    onChange={(e) => setSelectedImportance(e.target.value)}
                    className="input"
                  >
                    {importanceLevels.map((level) => (
                      <option key={level.value} value={level.value}>
                        {level.label}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Categoria
                  </label>
                  <select
                    value={selectedCategory}
                    onChange={(e) => setSelectedCategory(e.target.value)}
                    className="input"
                  >
                    {categories.map((category) => (
                      <option key={category.value} value={category.value}>
                        {category.label}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Events */}
        {Object.keys(groupedEvents).length > 0 ? (
          <div className="space-y-8">
            {Object.entries(groupedEvents).map(([date, dateEvents]) => (
              <div key={date}>
                <div className="flex items-center space-x-3 mb-4">
                  <Calendar className="h-6 w-6 text-primary-600" />
                  <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
                    {formatDate(date)}
                  </h2>
                  <span className="badge-primary">
                    {dateEvents.length} evento{dateEvents.length !== 1 ? 's' : ''}
                  </span>
                </div>

                <div className="space-y-4">
                  {dateEvents.map((event, index) => (
                    <div key={index} className="card dark:bg-gray-800 dark:border-gray-700 p-6 hover:shadow-card-hover transition-shadow">
                      <div className="flex items-start space-x-4">
                        {/* Time and Importance */}
                        <div className="flex-shrink-0">
                          <div className="flex items-center space-x-2 mb-2">
                            <Clock className="h-4 w-4 text-gray-400 dark:text-gray-500" />
                            <span className="text-sm font-medium text-gray-900 dark:text-white">
                              {event.time ? formatTime(event.time) : 'N/A'}
                            </span>
                          </div>
                          <div className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium border ${
                            getImportanceColor(event.importance)
                          }`}>
                            <span className="mr-1">{getImportanceIcon(event.importance)}</span>
                            {event.importance === 'high' ? 'Alta' : 
                             event.importance === 'medium' ? 'Média' : 'Baixa'}
                          </div>
                        </div>

                        {/* Event Details */}
                        <div className="flex-1">
                          <div className="flex items-start justify-between">
                            <div className="flex-1">
                              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-1">
                                {event.title}
                              </h3>
                              {event.description && (
                                <p className="text-gray-600 dark:text-gray-300 text-sm mb-2">
                                  {event.description}
                                </p>
                              )}
                              <div className="flex items-center space-x-4 text-sm text-gray-500 dark:text-gray-400">
                                <div className="flex items-center space-x-1">
                                  <Globe className="h-4 w-4" />
                                  <span>{event.country}</span>
                                </div>
                                {event.category && (
                                  <span className="badge-secondary">
                                    {event.category}
                                  </span>
                                )}
                              </div>
                            </div>
                          </div>

                          {/* Forecast vs Actual */}
                          {(event.forecast || event.previous || event.actual) && (
                            <div className="mt-4 grid grid-cols-3 gap-4 p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
                              {event.previous && (
                                <div>
                                  <p className="text-xs text-gray-500 dark:text-gray-400">Anterior</p>
                                  <p className="text-sm font-medium text-gray-900 dark:text-white">
                                    {event.previous}
                                  </p>
                                </div>
                              )}
                              {event.forecast && (
                                <div>
                                  <p className="text-xs text-gray-500 dark:text-gray-400">Previsão</p>
                                  <p className="text-sm font-medium text-gray-900 dark:text-white">
                                    {event.forecast}
                                  </p>
                                </div>
                              )}
                              {event.actual && (
                                <div>
                                  <p className="text-xs text-gray-500 dark:text-gray-400">Atual</p>
                                  <p className={`text-sm font-medium ${
                                    event.actual === event.forecast ? 'text-gray-900 dark:text-white' :
                                    parseFloat(event.actual) > parseFloat(event.forecast || '0') ? 'text-success-600' : 'text-danger-600'
                                  }`}>
                                    {event.actual}
                                  </p>
                                </div>
                              )}
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-12">
            <Calendar className="mx-auto h-12 w-12 text-gray-400 dark:text-gray-500" />
            <h3 className="mt-2 text-sm font-medium text-gray-900 dark:text-white">Nenhum evento encontrado</h3>
            <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
              Não há eventos econômicos para os filtros selecionados.
            </p>
            <div className="mt-6">
              <button
                onClick={() => {
                  setSelectedCountry('all');
                  setSelectedImportance('all');
                  setSelectedCategory('all');
                  setViewMode('today');
                }}
                className="btn-primary"
              >
                Limpar Filtros
              </button>
            </div>
          </div>
        )}

        {loading && events.length > 0 && (
          <div className="flex justify-center mt-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600"></div>
          </div>
        )}
      </div>
    </div>
  );
};

export default CalendarPage;