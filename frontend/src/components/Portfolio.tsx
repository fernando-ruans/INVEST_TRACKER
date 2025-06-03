import React, { useState, useEffect } from 'react';
import { Plus, TrendingUp, TrendingDown, DollarSign, PieChart, BarChart3, Edit, Trash2 } from 'lucide-react';
import { portfolioService, assetService } from '../services/api';
import { Portfolio as PortfolioType, PortfolioAsset, PortfolioPerformance, AssetSearchResult } from '../types';
import { SimpleTradingViewChart } from './TradingViewChart';

const Portfolio: React.FC = () => {
  const [portfolios, setPortfolios] = useState<PortfolioType[]>([]);
  const [selectedPortfolio, setSelectedPortfolio] = useState<PortfolioType | null>(null);
  const [portfolioAssets, setPortfolioAssets] = useState<PortfolioAsset[]>([]);
  const [performance, setPerformance] = useState<PortfolioPerformance | null>(null);
  const [loading, setLoading] = useState(true);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showAddAssetModal, setShowAddAssetModal] = useState(false);

  useEffect(() => {
    loadPortfolios();
  }, []);

  useEffect(() => {
    if (selectedPortfolio) {
      loadPortfolioData(selectedPortfolio.id);
    }
  }, [selectedPortfolio]);

  const loadPortfolios = async () => {
    try {
      const data = await portfolioService.getPortfolios();
      setPortfolios(data);
      if (data.length > 0 && !selectedPortfolio) {
        setSelectedPortfolio(data[0]);
      }
    } catch (error) {
      console.error('Erro ao carregar portfólios:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadPortfolioData = async (portfolioId: number) => {
    try {
      const [assets, perf] = await Promise.all([
        portfolioService.getPortfolioAssets(portfolioId),
        portfolioService.getPortfolioPerformance(portfolioId)
      ]);
      console.log('Portfolio assets:', assets);
      console.log('Portfolio assets detailed:', assets.map(asset => ({
        symbol: asset.symbol,
        currentPrice: asset.currentPrice,
        totalValue: asset.totalValue,
        profit_loss: asset.gain,
        profit_loss_percent: asset.gainPercent
      })));
      console.log('Portfolio performance:', perf);
      setPortfolioAssets(assets);
      setPerformance(perf);
    } catch (error) {
      console.error('Erro ao carregar dados do portfólio:', error);
    }
  };

  const createPortfolio = async (name: string, description: string) => {
    try {
      const newPortfolio = await portfolioService.createPortfolio({ name, description });
      setPortfolios([...portfolios, newPortfolio]);
      setSelectedPortfolio(newPortfolio);
      setShowCreateModal(false);
    } catch (error) {
      console.error('Erro ao criar portfólio:', error);
    }
  };

  const addAssetToPortfolio = async (symbol: string, quantity: number, averagePrice: number) => {
    if (!selectedPortfolio) return;
    
    try {
      await portfolioService.addAssetToPortfolio(selectedPortfolio.id, {
        symbol,
        quantity,
        averagePrice
      });
      loadPortfolioData(selectedPortfolio.id);
      setShowAddAssetModal(false);
    } catch (error) {
      console.error('Erro ao adicionar ativo:', error);
    }
  };

  const removeAsset = async (assetId: number) => {
    if (!selectedPortfolio) return;
    
    try {
      await portfolioService.removeAssetFromPortfolio(assetId);
      loadPortfolioData(selectedPortfolio.id);
    } catch (error) {
      console.error('Erro ao remover ativo:', error);
    }
  };

  const deletePortfolio = async (portfolioId: number) => {
    // Use window.confirm instead of global confirm to avoid ESLint warning
    if (!window.confirm('Tem certeza que deseja deletar este portfólio? Esta ação não pode ser desfeita.')) {
      return;
    }
    
    try {
      await portfolioService.deletePortfolio(portfolioId);
      const updatedPortfolios = portfolios.filter(p => p.id !== portfolioId);
      setPortfolios(updatedPortfolios);
      
      // Se o portfólio deletado era o selecionado, selecionar outro ou limpar
      if (selectedPortfolio?.id === portfolioId) {
        if (updatedPortfolios.length > 0) {
          setSelectedPortfolio(updatedPortfolios[0]);
        } else {
          setSelectedPortfolio(null);
          setPortfolioAssets([]);
          setPerformance(null);
        }
      }
    } catch (error) {
      console.error('Erro ao deletar portfólio:', error);
      // Use window.alert instead of global alert
      window.alert('Erro ao deletar portfólio. Tente novamente.');
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary-600 dark:border-primary-400"></div>
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
              <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Portfólios</h1>
              <p className="mt-2 text-gray-600 dark:text-gray-300">
                Gerencie seus investimentos e acompanhe o desempenho.
              </p>
            </div>
            <button
              onClick={() => setShowCreateModal(true)}
              className="btn-primary"
            >
              <Plus className="h-5 w-5 mr-2" />
              Novo Portfólio
            </button>
          </div>
        </div>

        {/* Seletor de Portfólio */}
        {portfolios.length > 0 && (
          <div className="mb-6">
            <div className="flex space-x-4 overflow-x-auto pb-2">
              {portfolios.map((portfolio) => (
                <div key={portfolio.id} className="flex-shrink-0 flex items-center space-x-2">
                  <button
                    onClick={() => setSelectedPortfolio(portfolio)}
                    className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                      selectedPortfolio?.id === portfolio.id
                        ? 'bg-primary-600 text-white'
                        : 'bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 border border-gray-200 dark:border-gray-600'
                    }`}
                  >
                    {portfolio.name}
                  </button>
                  <button
                    onClick={() => deletePortfolio(portfolio.id)}
                    className="p-2 text-danger-600 hover:text-danger-800 dark:hover:text-danger-400 hover:bg-danger-50 dark:hover:bg-danger-900/20 rounded-lg transition-colors"
                    title="Deletar portfólio"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}

        {selectedPortfolio ? (
          <div className="space-y-6">
            {/* Cards de Performance */}
            {performance && (
              <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                <div className="card dark:bg-gray-800 dark:border-gray-700">
                  <div className="card-body">
                    <div className="flex items-center">
                      <div className="flex-shrink-0">
                        <DollarSign className="h-8 w-8 text-primary-600" />
                      </div>
                      <div className="ml-4">
                        <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Valor Total</p>
                        <p className="text-2xl font-bold text-gray-900 dark:text-white">
                          R$ {(performance?.totalValue || 0).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="card dark:bg-gray-800 dark:border-gray-700">
                  <div className="card-body">
                    <div className="flex items-center">
                      <div className="flex-shrink-0">
                        <TrendingUp className="h-8 w-8 text-success-600" />
                      </div>
                      <div className="ml-4">
                        <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Ganho/Perda</p>
                        <p className={`text-2xl font-bold ${
                          (performance?.totalGain || 0) >= 0 ? 'text-success-600' : 'text-danger-600'
                         }`}>
                           R$ {(performance?.totalGain || 0).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="card dark:bg-gray-800 dark:border-gray-700">
                  <div className="card-body">
                    <div className="flex items-center">
                      <div className="flex-shrink-0">
                        <BarChart3 className="h-8 w-8 text-warning-600" />
                      </div>
                      <div className="ml-4">
                        <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Retorno (%)</p>
                        <p className={`text-2xl font-bold ${
                          (performance?.totalGainPercent || 0) >= 0 ? 'text-success-600' : 'text-danger-600'
                         }`}>
                           {performance?.totalGainPercent?.toFixed(2) || '0.00'}%
                        </p>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="card dark:bg-gray-800 dark:border-gray-700">
                  <div className="card-body">
                    <div className="flex items-center">
                      <div className="flex-shrink-0">
                        <PieChart className="h-8 w-8 text-purple-600" />
                      </div>
                      <div className="ml-4">
                        <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Ativos</p>
                        <p className="text-2xl font-bold text-gray-900 dark:text-white">
                          {portfolioAssets.length}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Lista de Ativos */}
            <div className="card dark:bg-gray-800 dark:border-gray-700">
              <div className="card-header dark:border-gray-700">
                <div className="flex justify-between items-center">
                  <h3 className="text-lg font-medium text-gray-900 dark:text-white">Ativos do Portfólio</h3>
                  <button
                    onClick={() => setShowAddAssetModal(true)}
                    className="btn-primary btn-sm"
                  >
                    <Plus className="h-4 w-4 mr-1" />
                    Adicionar Ativo
                  </button>
                </div>
              </div>
              <div className="card-body p-0">
                {portfolioAssets.length > 0 ? (
                  <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                      <thead className="bg-gray-50 dark:bg-gray-700">
                        <tr>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                            Ativo
                          </th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                            Quantidade
                          </th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                            Preço Médio
                          </th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                            Preço Atual
                          </th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                            Valor Atual
                          </th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                            Ganho/Perda
                          </th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                            Ações
                          </th>
                        </tr>
                      </thead>
                      <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                        {portfolioAssets.map((asset) => (
                          <tr key={asset.id} className="hover:bg-gray-50 dark:hover:bg-gray-700">
                            <td className="px-6 py-4 whitespace-nowrap">
                              <div className="text-sm font-medium text-gray-900 dark:text-white">
                                {asset.symbol}
                              </div>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-gray-300">
                              {asset.quantity}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-gray-300">
                              R$ {asset.averagePrice?.toFixed(2) || '0.00'}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-gray-300">
                              R$ {asset.currentPrice && !isNaN(asset.currentPrice) ? asset.currentPrice.toFixed(2) : '0.00'}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-gray-300">
                              R$ {(asset.currentPrice && !isNaN(asset.currentPrice) ? (asset.currentPrice * asset.quantity).toFixed(2) : '0.00')}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <span className={`text-sm font-medium ${
                                (asset.gain !== undefined && asset.gain >= 0)
                                  ? 'text-success-600'
                                  : 'text-danger-600'
                              }`}>
                                R$ {asset.gain ? asset.gain.toFixed(2) : '0.00'}
                              </span>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                              <button
                                onClick={() => removeAsset(asset.id)}
                                className="text-danger-600 hover:text-danger-900 dark:hover:text-danger-400"
                              >
                                <Trash2 className="h-4 w-4" />
                              </button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                ) : (
                  <div className="text-center py-12">
                    <PieChart className="mx-auto h-12 w-12 text-gray-400 dark:text-gray-500" />
                    <h3 className="mt-2 text-sm font-medium text-gray-900 dark:text-white">Nenhum ativo</h3>
                    <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                      Adicione ativos ao seu portfólio para começar.
                    </p>
                    <div className="mt-6">
                      <button
                        onClick={() => setShowAddAssetModal(true)}
                        className="btn-primary"
                      >
                        <Plus className="h-5 w-5 mr-2" />
                        Adicionar Primeiro Ativo
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        ) : (
          <div className="text-center py-12">
            <PieChart className="mx-auto h-12 w-12 text-gray-400 dark:text-gray-500" />
            <h3 className="mt-2 text-sm font-medium text-gray-900 dark:text-white">Nenhum portfólio</h3>
            <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
              Crie seu primeiro portfólio para começar a acompanhar seus investimentos.
            </p>
            <div className="mt-6">
              <button
                onClick={() => setShowCreateModal(true)}
                className="btn-primary"
              >
                <Plus className="h-5 w-5 mr-2" />
                Criar Primeiro Portfólio
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Modais */}
      <CreatePortfolioModal
        isOpen={showCreateModal}
        onClose={() => setShowCreateModal(false)}
        onSubmit={createPortfolio}
      />
      
      <AddAssetModal
        isOpen={showAddAssetModal}
        onClose={() => setShowAddAssetModal(false)}
        onSubmit={addAssetToPortfolio}
      />
    </div>
  );
};

// Modal para criar portfólio
const CreatePortfolioModal: React.FC<{
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (name: string, description: string) => void;
}> = ({ isOpen, onClose, onSubmit }) => {
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (name.trim()) {
      onSubmit(name.trim(), description.trim());
      setName('');
      setDescription('');
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
      <div className="relative top-20 mx-auto p-5 border w-96 shadow-lg rounded-md bg-white dark:bg-gray-800 dark:border-gray-700">
        <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-4">Criar Novo Portfólio</h3>
        <form onSubmit={handleSubmit}>
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Nome do Portfólio
            </label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="input"
              placeholder="Ex: Meu Portfólio Principal"
              required
            />
          </div>
          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Descrição (opcional)
            </label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="input"
              rows={3}
              placeholder="Descrição do portfólio..."
            />
          </div>
          <div className="flex justify-end space-x-3">
            <button
              type="button"
              onClick={onClose}
              className="btn-outline"
            >
              Cancelar
            </button>
            <button type="submit" className="btn-primary">
              Criar Portfólio
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

// Modal para adicionar ativo
const AddAssetModal: React.FC<{
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (symbol: string, quantity: number, averagePrice: number) => void;
}> = ({ isOpen, onClose, onSubmit }) => {
  const [symbol, setSymbol] = useState('');
  const [quantity, setQuantity] = useState('');
  const [averagePrice, setAveragePrice] = useState('');
  const [searchResults, setSearchResults] = useState<AssetSearchResult[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [showResults, setShowResults] = useState(false);

  const handleSymbolChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setSymbol(value);
    
    if (value.length >= 2) {
      setIsSearching(true);
      setShowResults(true);
      try {
        const results = await assetService.searchAssets(value);
        setSearchResults(results);
      } catch (error) {
        console.error('Erro ao buscar ativos:', error);
      } finally {
        setIsSearching(false);
      }
    } else {
      setSearchResults([]);
      setShowResults(false);
    }
  };

  const handleSelectAsset = (asset: AssetSearchResult) => {
    setSymbol(asset.symbol);
    setShowResults(false);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (symbol.trim() && quantity && averagePrice) {
      onSubmit(symbol.trim().toUpperCase(), parseFloat(quantity), parseFloat(averagePrice));
      setSymbol('');
      setQuantity('');
      setAveragePrice('');
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
      <div className="relative top-20 mx-auto p-5 border w-96 shadow-lg rounded-md bg-white dark:bg-gray-800 dark:border-gray-700">
        <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-4">Adicionar Ativo</h3>
        <form onSubmit={handleSubmit}>
          <div className="mb-4 relative">
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Símbolo do Ativo
            </label>
            <input
              type="text"
              value={symbol}
              onChange={handleSymbolChange}
              className="input"
              placeholder="Ex: PETR4, VALE3, ITUB4"
              required
            />
            {isSearching && (
              <div className="absolute right-3 top-9">
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-500"></div>
              </div>
            )}
            {showResults && searchResults.length > 0 && (
              <div className="absolute z-10 mt-1 w-full bg-white dark:bg-gray-700 shadow-lg rounded-md max-h-60 overflow-auto">
                {searchResults.map((asset) => (
                  <div
                    key={asset.symbol}
                    className="p-2 hover:bg-gray-100 dark:hover:bg-gray-600 cursor-pointer flex justify-between items-center"
                    onClick={() => handleSelectAsset(asset)}
                  >
                    <div>
                      <div className="font-medium">{asset.symbol}</div>
                      <div className="text-xs text-gray-500 dark:text-gray-400">{asset.name}</div>
                    </div>
                    <div className="text-xs bg-gray-200 dark:bg-gray-600 px-2 py-1 rounded">
                      {asset.exchange}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Quantidade
            </label>
            <input
              type="number"
              value={quantity}
              onChange={(e) => setQuantity(e.target.value)}
              className="input"
              placeholder="100"
              min="0"
              step="1"
              required
            />
          </div>
          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Preço Médio (R$)
            </label>
            <input
              type="number"
              value={averagePrice}
              onChange={(e) => setAveragePrice(e.target.value)}
              className="input"
              placeholder="25.50"
              min="0"
              step="0.01"
              required
            />
          </div>
          <div className="flex justify-end space-x-3">
            <button
              type="button"
              onClick={onClose}
              className="btn-outline"
            >
              Cancelar
            </button>
            <button type="submit" className="btn-primary">
              Adicionar Ativo
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default Portfolio;