import React from 'react';
import InvestingCalendarWidget from './InvestingCalendarWidget';
import { useTheme } from '../contexts/ThemeContext';

const CalendarPage: React.FC = () => {
  const { theme } = useTheme();

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
          </div>
        </div>

        {/* Investing.com Calendar Widget */}
        <div className="mb-8">
          <div className="card dark:bg-gray-800 dark:border-gray-700 p-6">
            <InvestingCalendarWidget 
              theme={theme === 'dark' ? 'dark' : 'light'}
              height={800} 
              width="100%"
              timeSpan="thisWeek"
              showCountries={['BR', 'US', 'EU', 'GB', 'CN', 'JP']}
              importanceLevel={3}
              className="mb-4"
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default CalendarPage;