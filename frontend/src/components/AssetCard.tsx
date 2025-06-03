import React, { useState, useEffect } from 'react';
import { AssetInfo } from '../types';
import { assetService } from '../services';

interface AssetCardProps {
  symbol: string;
  onRemove?: () => void;
  onClick?: () => void;
  showRemoveButton?: boolean;
}

const AssetCard: React.FC<AssetCardProps> = ({
  symbol,
  onRemove,
  onClick,
  showRemoveButton = false
}) => {
  const [assetInfo, setAssetInfo] = useState<AssetInfo | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchAssetInfo = async () => {
      try {
        setLoading(true);
        const info = await assetService.getAssetInfo(symbol);
        setAssetInfo(info);
        setError(null);
      } catch (err) {
        setError('Failed to load asset data');
        console.error('Error fetching asset info:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchAssetInfo();
  }, [symbol]);

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    }).format(value);
  };

  const formatMarketCap = (value: number | null | undefined) => {
    if (!value || value === 0) return 'N/A';
    if (value >= 1e12) return `$${(value / 1e12).toFixed(2)}T`;
    if (value >= 1e9) return `$${(value / 1e9).toFixed(2)}B`;
    if (value >= 1e6) return `$${(value / 1e6).toFixed(2)}M`;
    return `$${value.toLocaleString()}`;
  };



  if (loading) {
    return (
      <div className="card dark:bg-gray-800 dark:border-gray-700 p-6 animate-pulse">
        <div className="flex justify-between items-start mb-4">
          <div>
            <div className="h-6 bg-gray-200 dark:bg-gray-600 rounded w-20 mb-2"></div>
            <div className="h-4 bg-gray-200 dark:bg-gray-600 rounded w-32"></div>
          </div>
          {showRemoveButton && (
            <div className="h-8 w-8 bg-gray-200 dark:bg-gray-600 rounded"></div>
          )}
        </div>
        <div className="space-y-2">
          <div className="h-8 bg-gray-200 dark:bg-gray-600 rounded w-24"></div>
          <div className="h-4 bg-gray-200 dark:bg-gray-600 rounded w-16"></div>
        </div>
      </div>
    );
  }

  if (error || !assetInfo) {
    return (
      <div className="card dark:bg-gray-800 dark:border-gray-700 p-6 border-danger-200 dark:border-red-800">
        <div className="flex justify-between items-start mb-4">
          <div>
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">{symbol}</h3>
            <p className="text-sm text-danger-600 dark:text-red-400">{error || 'Asset not found'}</p>
          </div>
          {showRemoveButton && onRemove && (
            <button
              onClick={onRemove}
              className="text-gray-400 dark:text-gray-500 hover:text-danger-600 dark:hover:text-red-400 transition-colors"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          )}
        </div>
      </div>
    );
  }

  const priceChange = assetInfo.change;
  const priceChangePercent = assetInfo.changePercent;

  return (
    <div 
      className={`card dark:bg-gray-800 dark:border-gray-700 p-6 transition-all duration-200 ${
        onClick ? 'cursor-pointer hover:shadow-lg hover:border-primary-300 dark:hover:border-primary-600' : ''
      }`}
      onClick={onClick}
    >
      <div className="flex justify-between items-start mb-4">
        <div>
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white">{assetInfo.symbol}</h3>
          <p className="text-sm text-gray-600 dark:text-gray-300 truncate max-w-48">{assetInfo.name}</p>
        </div>
        {showRemoveButton && onRemove && (
          <button
            onClick={(e) => {
              e.stopPropagation();
              onRemove();
            }}
            className="text-gray-400 dark:text-gray-500 hover:text-danger-600 dark:hover:text-red-400 transition-colors"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        )}
      </div>

      <div className="space-y-3">
        <div>
          <div className="flex items-center space-x-2">
            <span className="text-2xl font-bold text-gray-900 dark:text-white">
              {formatCurrency(assetInfo.price)}
            </span>
            <span className={`text-sm font-medium ${priceChange >= 0 ? 'text-success-600 dark:text-green-400' : 'text-danger-600 dark:text-red-400'}`}>
              {priceChange >= 0 ? '↗' : '↘'}
              {formatCurrency(Math.abs(priceChange))} ({Math.abs(priceChangePercent).toFixed(2)}%)
            </span>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4 text-sm">
          <div>
            <span className="text-gray-500 dark:text-gray-400">Market Cap</span>
            <p className="font-medium dark:text-white">{formatMarketCap(assetInfo.marketCap)}</p>
          </div>
          <div>
            <span className="text-gray-500 dark:text-gray-400">Volume</span>
            <p className="font-medium dark:text-white">{assetInfo.volume ? assetInfo.volume.toLocaleString() : 'N/A'}</p>
          </div>
          <div>
            <span className="text-gray-500 dark:text-gray-400">P/E Ratio</span>
            <p className="font-medium dark:text-white">{assetInfo.peRatio ? assetInfo.peRatio.toFixed(2) : 'N/A'}</p>
          </div>
          <div>
            <span className="text-gray-500 dark:text-gray-400">Dividend Yield</span>
            <p className="font-medium dark:text-white">
              {assetInfo.dividendYield ? `${(assetInfo.dividendYield * 100).toFixed(2)}%` : 'N/A'}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AssetCard;