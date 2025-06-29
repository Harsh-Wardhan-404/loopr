import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import {
  LayoutDashboard,
  CreditCard,
  Wallet,
  BarChart3,
  User,
  MessageSquare,
  Settings,
  Search,
  Bell,
  Download,
  Filter,
  Calendar,
  LogOut,
  TrendingUp,
  TrendingDown,
  DollarSign,
  PiggyBank,
  X,
} from 'lucide-react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { transactionsAPI, analyticsAPI, authAPI } from '../services/api';
import type { Transaction, AnalyticsData, TransactionFilters as FilterType, SortConfig, PaginationConfig } from '../types';
import TransactionTable from './TransactionTable';
import TransactionFilters from './TransactionFilters';
import Pagination from './Pagination';
import CSVExport from './CSVExport';

const Dashboard: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [user] = useState(() => {
    const userData = localStorage.getItem('user');
    return userData ? JSON.parse(userData) : null;
  });

  // Get current active page from URL
  const currentPage = location.pathname.split('/')[1] || 'dashboard';

  // State management
  const [analytics, setAnalytics] = useState<AnalyticsData | null>(null);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState<Partial<FilterType>>({});
  const [sortConfig, setSortConfig] = useState<SortConfig>({ key: 'date', direction: 'desc' });
  const [pagination, setPagination] = useState<PaginationConfig>({
    page: 1,
    limit: 5,
    total: 0,
    totalPages: 0,
  });
  const [showFilters, setShowFilters] = useState(false);
  const [showExport, setShowExport] = useState(false);
  const [showRecentTransactions, setShowRecentTransactions] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [debouncedSearchTerm, setDebouncedSearchTerm] = useState('');

  // Chart control state
  const [chartView, setChartView] = useState<'both' | 'income' | 'expenses'>('both');
  const [timePeriod, setTimePeriod] = useState<'weekly' | 'monthly' | 'yearly'>('monthly');

  // Debounce search term
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearchTerm(searchTerm);
    }, 500); // 500ms debounce delay

    return () => clearTimeout(timer);
  }, [searchTerm]);

  // Reset pagination when search term changes
  useEffect(() => {
    setPagination(prev => ({ ...prev, page: 1 }));
  }, [debouncedSearchTerm]);

  // Load data
  useEffect(() => {
    loadDashboardData();
  }, []);

  useEffect(() => {
    loadTransactions();
  }, [filters, sortConfig, pagination.page, pagination.limit, debouncedSearchTerm]);

  const loadDashboardData = async () => {
    try {
      const analyticsData = await analyticsAPI.getAnalytics();
      setAnalytics(analyticsData);
    } catch (error) {
      console.error('Error loading analytics:', error);
    }
  };

  const loadTransactions = async () => {
    try {
      setLoading(true);
      const response = await transactionsAPI.getTransactions(
        { ...filters, search: debouncedSearchTerm },
        sortConfig,
        { page: pagination.page, limit: pagination.limit }
      );
      setTransactions(response.transactions);
      setPagination(response.pagination);
    } catch (error) {
      console.error('Error loading transactions:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    authAPI.logout();
    navigate('/');
  };

  const handleSearch = (term: string) => {
    setSearchTerm(term);
  };

  const handleFilterChange = (newFilters: Partial<FilterType>) => {
    setFilters(newFilters);
    setPagination(prev => ({ ...prev, page: 1 }));
  };

  const handleSortChange = (newSort: SortConfig) => {
    setSortConfig(newSort);
    setPagination(prev => ({ ...prev, page: 1 }));
  };

  const handlePageChange = (page: number) => {
    setPagination(prev => ({ ...prev, page }));
  };

  const handleLimitChange = (limit: number) => {
    setPagination(prev => ({ ...prev, limit, page: 1 }));
  };

  // Chart control handlers
  const handleChartViewChange = (view: 'income' | 'expenses') => {
    // Toggle behavior: if clicking the same button, show both; otherwise show only the selected one
    if (chartView === view) {
      setChartView('both');
    } else {
      setChartView(view);
    }
  };

  const handleTimePeriodChange = (period: 'weekly' | 'monthly' | 'yearly') => {
    setTimePeriod(period);
  };

  // Chart data preparation with time period filtering
  const getFilteredChartData = () => {
    if (!analytics?.monthlyData) return [];

    const baseData = analytics.monthlyData.map(item => ({
      month: item.month,
      Balance: item.income,
      Expenses: item.expenses,
    }));

    switch (timePeriod) {
      case 'weekly':
        // Transform monthly data to weekly data (simulate 4 weeks per month)
        const weeklyData: Array<{ month: string; Balance: number; Expenses: number }> = [];
        baseData.slice(-3).forEach((monthData, monthIndex) => {
          const weeksInMonth = 4;
          for (let week = 1; week <= weeksInMonth; week++) {
            weeklyData.push({
              month: `${monthData.month} W${week}`,
              Balance: Math.round((monthData.Balance / weeksInMonth) * (0.8 + Math.random() * 0.4)), // Add some variation
              Expenses: Math.round((monthData.Expenses / weeksInMonth) * (0.8 + Math.random() * 0.4)),
            });
          }
        });
        return weeklyData;

      case 'yearly':
        // Aggregate monthly data into yearly totals
        const currentYear = new Date().getFullYear();
        const years = [currentYear - 2, currentYear - 1, currentYear];

        return years.map((year, index) => {
          // Use different chunks of monthly data for each year
          const startIndex = index * 4;
          const yearData = baseData.slice(startIndex, startIndex + 12);

          const totalIncome = yearData.reduce((sum, month) => sum + month.Balance, 0);
          const totalExpenses = yearData.reduce((sum, month) => sum + month.Expenses, 0);

          return {
            month: year.toString(),
            Balance: totalIncome,
            Expenses: totalExpenses,
          };
        });

      case 'monthly':
      default:
        // Return the last 12 months of data
        return baseData.slice(-12);
    }
  };

  const chartData = getFilteredChartData();

  // Recent transactions for sidebar
  const recentTransactions = transactions.slice(0, 6) || [];

  const formatCurrency = (amount: number): string => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(amount);
  };

  const getInitials = (firstName?: string, lastName?: string): string => {
    return `${firstName?.[0] || ''}${lastName?.[0] || ''}`.toUpperCase();
  };

  // Type-safe tick formatter
  const formatYAxisTick = (value: number): string => {
    return `$${value / 1000}k`;
  };

  // Type-safe tooltip formatter
  const formatTooltipValue = (value: number): [string, string] => {
    return [formatCurrency(value), ''];
  };

  // Render content based on current page
  const renderPageContent = () => {
    switch (currentPage) {
      case 'dashboard':
        return renderDashboardContent();
      case 'transactions':
        return renderTransactionsContent();
      case 'wallet':
        return renderWalletContent();
      case 'analytics':
        return renderAnalyticsContent();
      case 'personal':
        return renderPersonalContent();
      case 'message':
        return renderMessageContent();
      case 'setting':
        return renderSettingContent();
      default:
        return renderDashboardContent();
    }
  };

  const renderDashboardContent = () => (
    <>
      {/* Stats Grid */}
      <div className="stats-grid">
        <div className="stat-card">
          <div className="stat-icon income">
            <TrendingUp className="w-6 h-6" />
          </div>
          <div className="stat-info">
            <h3>Balance</h3>
            <p>{formatCurrency(analytics?.totalIncome || 41210)}</p>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon revenue">
            <DollarSign className="w-6 h-6" />
          </div>
          <div className="stat-info">
            <h3>Revenue</h3>
            <p>{formatCurrency(analytics?.totalRevenue || 41210)}</p>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon expenses">
            <TrendingDown className="w-6 h-6" />
          </div>
          <div className="stat-info">
            <h3>Expenses</h3>
            <p>{formatCurrency(analytics?.totalExpenses || 41210)}</p>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon savings">
            <PiggyBank className="w-6 h-6" />
          </div>
          <div className="stat-info">
            <h3>Savings</h3>
            <p>{formatCurrency(analytics?.totalSavings || 41210)}</p>
          </div>
        </div>
      </div>

      {/* Overview Chart */}
      <div className="overview-section">
        <div className="overview-header">
          <h2 className="overview-title">Overview</h2>
          <div className="overview-controls">
            <div className="toggle-buttons">
              <button
                onClick={() => handleChartViewChange('income')}
                className={`toggle-btn ${chartView === 'income' ? 'active' : ''}`}
              >
                Balance
              </button>
              <button
                onClick={() => handleChartViewChange('expenses')}
                className={`toggle-btn ${chartView === 'expenses' ? 'active' : ''}`}
              >
                Expenses
              </button>
            </div>
            <select
              value={timePeriod}
              onChange={(e) => handleTimePeriodChange(e.target.value as 'weekly' | 'monthly' | 'yearly')}
              className="bg-slate-700 border border-gray-600 rounded-lg px-3 py-2 text-white text-sm"
            >
              <option value="weekly">Weekly</option>
              <option value="monthly">Monthly</option>
              <option value="yearly">Yearly</option>
            </select>
          </div>
        </div>

        {/* Chart Legend */}
        <div className="flex items-center justify-center gap-6 mb-4">
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 rounded-full bg-green-500"></div>
            <span className="text-sm text-gray-300">Balance</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 rounded-full bg-yellow-500"></div>
            <span className="text-sm text-gray-300">Expenses</span>
          </div>
        </div>

        <div className="chart-container">
          {loading ? (
            <div className="flex items-center justify-center h-full">
              <div className="text-gray-400">Loading chart...</div>
            </div>
          ) : chartData.length > 0 ? (
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                <XAxis
                  dataKey="month"
                  axisLine={false}
                  tickLine={false}
                  tick={{ fill: '#9CA3AF', fontSize: 12 }}
                />
                <YAxis
                  axisLine={false}
                  tickLine={false}
                  tick={{ fill: '#9CA3AF', fontSize: 12 }}
                  tickFormatter={formatYAxisTick}
                />
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#1F2937',
                    border: 'none',
                    borderRadius: '8px',
                    color: '#F9FAFB'
                  }}
                  formatter={formatTooltipValue}
                />
                {/* Conditionally render lines based on chartView */}
                {(chartView === 'income' || chartView === 'both') && (
                  <Line
                    type="monotone"
                    dataKey="Balance"
                    stroke="#22C55E"
                    strokeWidth={3}
                    dot={{ fill: '#22C55E', strokeWidth: 2, r: 4 }}
                    activeDot={{ r: 6, stroke: '#22C55E', strokeWidth: 2 }}
                  />
                )}
                {(chartView === 'expenses' || chartView === 'both') && (
                  <Line
                    type="monotone"
                    dataKey="Expenses"
                    stroke="#EAB308"
                    strokeWidth={3}
                    dot={{ fill: '#EAB308', strokeWidth: 2, r: 4 }}
                    activeDot={{ r: 6, stroke: '#EAB308', strokeWidth: 2 }}
                  />
                )}
              </LineChart>
            </ResponsiveContainer>
          ) : (
            <div className="flex items-center justify-center h-full">
              <div className="text-gray-400">No data available</div>
            </div>
          )}
        </div>
      </div>

      {/* Transactions Section */}
      <div className="bg-slate-800 border border-gray-600 rounded-2xl overflow-hidden">
        <div className="p-6 border-b border-gray-600">
          <div className="flex justify-between items-center">
            <h2 className="text-xl font-semibold text-white">Recent Transactions</h2>
            <div className="flex gap-3">
              <button
                onClick={() => setShowFilters(!showFilters)}
                className={`flex items-center gap-2 px-4 py-2 bg-slate-700 text-white rounded-lg hover:bg-slate-600 transition-colors ${showFilters ? 'bg-emerald-600 hover:bg-emerald-700' : ''}`}
              >
                <Filter className="w-4 h-4" />
                Filters
              </button>
              <button
                onClick={() => navigate('/transactions')}
                className="flex items-center gap-2 px-4 py-2 bg-slate-700 text-white rounded-lg hover:bg-slate-600 transition-colors"
              >
                <CreditCard className="w-4 h-4" />
                View All
              </button>
              <button
                onClick={() => setShowExport(true)}
                className="flex items-center gap-2 px-4 py-2 bg-emerald-500 text-white rounded-lg hover:bg-emerald-600 transition-colors"
              >
                <Download className="w-4 h-4" />
                Export
              </button>
            </div>
          </div>
        </div>

        {/* Filters */}
        {showFilters && (
          <TransactionFilters
            filters={filters}
            onFiltersChange={handleFilterChange}
            onClose={() => setShowFilters(false)}
          />
        )}

        {/* Transaction Table */}
        <TransactionTable
          transactions={transactions}
          loading={loading}
          sortConfig={sortConfig}
          onSortChange={handleSortChange}
        />

        {/* Pagination */}
        <div className="p-6 border-t border-gray-600">
          <Pagination
            pagination={pagination}
            onPageChange={handlePageChange}
            onLimitChange={handleLimitChange}
          />
        </div>
      </div>

      {/* Recent Transactions Sidebar */}
      {showRecentTransactions && (
        <div className="fixed right-8 top-32 w-80 bg-slate-800 border border-gray-600 rounded-2xl p-6 shadow-xl z-10">
          <div className="flex justify-between items-center mb-6">
            <h3 className="text-lg font-semibold text-white">Recent Transactions</h3>
            <div className="flex items-center gap-2">
              <button
                onClick={() => navigate('/transactions')}
                className="text-emerald-400 text-sm hover:text-emerald-300"
              >
                See all
              </button>
              <button
                onClick={() => setShowRecentTransactions(false)}
                className="text-gray-400 hover:text-white transition-colors p-1 rounded-full hover:bg-gray-700"
                title="Close sidebar"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>

          <div className="space-y-4">
            {recentTransactions.slice(0, 6).map((transaction) => {
              const displayName = transaction.user_name || `User ${transaction.user_id}`;

              return (
                <div key={transaction._id} className="flex items-center gap-3">
                  {/* Profile Avatar */}
                  {transaction.user_profile ? (
                    <img
                      src={transaction.user_profile}
                      alt={displayName}
                      className="w-10 h-10 rounded-full object-cover"
                      onError={(e) => {
                        const target = e.target as HTMLImageElement;
                        target.style.display = 'none';
                        const fallback = target.nextElementSibling as HTMLElement;
                        if (fallback) fallback.style.display = 'flex';
                      }}
                    />
                  ) : null}
                  <div
                    className="w-10 h-10 rounded-full bg-gradient-to-r from-blue-400 to-purple-500 flex items-center justify-center text-white font-semibold text-sm"
                    style={{ display: transaction.user_profile ? 'none' : 'flex' }}
                  >
                    {displayName.charAt(0).toUpperCase()}
                  </div>

                  <div className="flex-1">
                    <div className="text-white font-medium text-sm">
                      {displayName}
                    </div>
                    <div className="text-gray-400 text-xs">
                      {transaction.description || 'No description'}
                    </div>
                  </div>
                  <div className={`font-semibold text-sm ${transaction.category === 'Revenue' ? 'text-emerald-400' : 'text-amber-400'
                    }`}>
                    {transaction.category === 'Revenue' ? '+' : '-'}{formatCurrency(transaction.amount || 0)}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Show Recent Transactions Button (when sidebar is hidden) */}
      {!showRecentTransactions && (
        <button
          onClick={() => setShowRecentTransactions(true)}
          className="fixed right-8 top-32 bg-emerald-500 hover:bg-emerald-600 text-white p-3 rounded-full shadow-lg transition-colors z-10"
          title="Show recent transactions"
        >
          <CreditCard className="w-5 h-5" />
        </button>
      )}
    </>
  );

  const renderTransactionsContent = () => (
    <div className="space-y-6">
      {/* Transactions Header */}
      <div className="bg-slate-800 border border-gray-600 rounded-2xl p-6">
        <div className="flex justify-between items-center mb-4">
          <div className="flex items-center gap-3">
            <CreditCard className="w-8 h-8 text-emerald-400" />
            <div>
              <h2 className="text-xl font-bold text-white">All Transactions</h2>
              <p className="text-gray-400 text-sm">Manage and track all your financial transactions</p>
            </div>
          </div>
          <div className="flex gap-3">
            <button
              onClick={() => setShowFilters(!showFilters)}
              className={`flex items-center gap-2 px-4 py-2 bg-slate-700 text-white rounded-lg hover:bg-slate-600 transition-colors ${showFilters ? 'bg-emerald-600 hover:bg-emerald-700' : ''}`}
            >
              <Filter className="w-4 h-4" />
              Filters
            </button>
            <button
              onClick={() => setShowExport(true)}
              className="flex items-center gap-2 px-4 py-2 bg-emerald-500 text-white rounded-lg hover:bg-emerald-600 transition-colors"
            >
              <Download className="w-4 h-4" />
              Export
            </button>
          </div>
        </div>

        {/* Quick Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="bg-slate-700 rounded-lg p-4">
            <h3 className="text-emerald-400 text-lg font-bold">{pagination.total || transactions.length}</h3>
            <p className="text-gray-400 text-sm">Total Transactions</p>
            <p className="text-gray-500 text-xs">Showing {transactions.length} on this page</p>
          </div>
          <div className="bg-slate-700 rounded-lg p-4">
            <h3 className="text-emerald-400 text-lg font-bold">
              {formatCurrency(analytics?.totalIncome || 0)}
            </h3>
            <p className="text-gray-400 text-sm">Total Income</p>
          </div>
          <div className="bg-slate-700 rounded-lg p-4">
            <h3 className="text-amber-400 text-lg font-bold">
              {formatCurrency(analytics?.totalExpenses || 0)}
            </h3>
            <p className="text-gray-400 text-sm">Total Expenses</p>
          </div>
          <div className="bg-slate-700 rounded-lg p-4">
            <h3 className="text-blue-400 text-lg font-bold">
              {formatCurrency((analytics?.totalIncome || 0) - (analytics?.totalExpenses || 0))}
            </h3>
            <p className="text-gray-400 text-sm">Net Balance</p>
          </div>
        </div>
      </div>

      {/* Filters */}
      {showFilters && (
        <TransactionFilters
          filters={filters}
          onFiltersChange={handleFilterChange}
          onClose={() => setShowFilters(false)}
        />
      )}

      {/* Transaction Table */}
      <div className="bg-slate-800 border border-gray-600 rounded-2xl overflow-hidden">
        <TransactionTable
          transactions={transactions}
          loading={loading}
          sortConfig={sortConfig}
          onSortChange={handleSortChange}
        />

        {/* Pagination */}
        <div className="p-6 border-t border-gray-600">
          <Pagination
            pagination={pagination}
            onPageChange={handlePageChange}
            onLimitChange={handleLimitChange}
          />
        </div>
      </div>
    </div>
  );

  const renderWalletContent = () => (
    <div className="space-y-6">
      <div className="bg-slate-800 border border-gray-600 rounded-2xl p-8 text-center">
        <Wallet className="w-16 h-16 text-emerald-400 mx-auto mb-4" />
        <h2 className="text-2xl font-bold text-white mb-2">Digital Wallet</h2>
        <p className="text-gray-400 mb-6">
          Manage your digital wallet, view balances, and track payment methods.
        </p>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="bg-gradient-to-br from-emerald-500 to-emerald-600 rounded-xl p-6 text-white">
            <h3 className="text-lg font-semibold mb-2">Current Balance</h3>
            <p className="text-3xl font-bold">{formatCurrency(15420.50)}</p>
            <p className="text-emerald-100 text-sm mt-2">Available for spending</p>
          </div>
          <div className="bg-slate-700 rounded-xl p-6">
            <h3 className="text-white font-semibold mb-4">Recent Activity</h3>
            <div className="space-y-3">
              <div className="flex justify-between text-sm">
                <span className="text-gray-400">Payment to Merchant A</span>
                <span className="text-white">-$120.00</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-400">Deposit from Bank</span>
                <span className="text-emerald-400">+$500.00</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-400">Subscription Fee</span>
                <span className="text-white">-$29.99</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  const renderAnalyticsContent = () => (
    <div className="space-y-6">
      <div className="bg-slate-800 border border-gray-600 rounded-2xl p-8 text-center">
        <BarChart3 className="w-16 h-16 text-emerald-400 mx-auto mb-4" />
        <h2 className="text-2xl font-bold text-white mb-2">Advanced Analytics</h2>
        <p className="text-gray-400 mb-6">
          Deep insights into your financial patterns and trends.
        </p>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="bg-slate-700 rounded-lg p-4">
            <h3 className="text-emerald-400 text-2xl font-bold">85%</h3>
            <p className="text-gray-400 text-sm">Profit Margin</p>
          </div>
          <div className="bg-slate-700 rounded-lg p-4">
            <h3 className="text-blue-400 text-2xl font-bold">12.5%</h3>
            <p className="text-gray-400 text-sm">Growth Rate</p>
          </div>
          <div className="bg-slate-700 rounded-lg p-4">
            <h3 className="text-yellow-400 text-2xl font-bold">24</h3>
            <p className="text-gray-400 text-sm">Avg. Daily Transactions</p>
          </div>
          <div className="bg-slate-700 rounded-lg p-4">
            <h3 className="text-purple-400 text-2xl font-bold">98.2%</h3>
            <p className="text-gray-400 text-sm">Payment Success Rate</p>
          </div>
        </div>
      </div>
    </div>
  );

  const renderPersonalContent = () => (
    <div className="space-y-6">
      <div className="bg-slate-800 border border-gray-600 rounded-2xl p-8">
        <div className="flex items-center gap-4 mb-6">
          <div className="w-16 h-16 bg-gradient-to-br from-emerald-400 to-emerald-600 rounded-full flex items-center justify-center">
            <User className="w-8 h-8 text-white" />
          </div>
          <div>
            <h2 className="text-2xl font-bold text-white">Personal Profile</h2>
            <p className="text-gray-400">Manage your account settings and preferences</p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">Email</label>
              <div className="bg-slate-700 rounded-lg p-3 text-white">{user?.email || 'user@example.com'}</div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">Member Since</label>
              <div className="bg-slate-700 rounded-lg p-3 text-white">January 2024</div>
            </div>
          </div>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">Account Status</label>
              <div className="bg-emerald-500/10 text-emerald-400 rounded-lg p-3 flex items-center gap-2">
                <div className="w-2 h-2 bg-emerald-400 rounded-full"></div>
                Active Premium
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">Security Level</label>
              <div className="bg-slate-700 rounded-lg p-3 text-white">Two-Factor Enabled</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  const renderMessageContent = () => (
    <div className="space-y-6">
      <div className="bg-slate-800 border border-gray-600 rounded-2xl p-8 text-center">
        <MessageSquare className="w-16 h-16 text-emerald-400 mx-auto mb-4" />
        <h2 className="text-2xl font-bold text-white mb-2">Messages & Notifications</h2>
        <p className="text-gray-400 mb-6">
          Stay updated with important notifications and system messages.
        </p>
        <div className="space-y-4">
          <div className="bg-slate-700 rounded-lg p-4 text-left">
            <div className="flex items-center gap-3 mb-2">
              <div className="w-2 h-2 bg-emerald-400 rounded-full"></div>
              <h3 className="text-white font-semibold">Transaction Completed</h3>
              <span className="text-gray-400 text-sm ml-auto">2 hours ago</span>
            </div>
            <p className="text-gray-400 text-sm">Your payment of $1,200.00 has been successfully processed.</p>
          </div>
          <div className="bg-slate-700 rounded-lg p-4 text-left">
            <div className="flex items-center gap-3 mb-2">
              <div className="w-2 h-2 bg-blue-400 rounded-full"></div>
              <h3 className="text-white font-semibold">System Update</h3>
              <span className="text-gray-400 text-sm ml-auto">1 day ago</span>
            </div>
            <p className="text-gray-400 text-sm">New features have been added to improve your experience.</p>
          </div>
          <div className="bg-slate-700 rounded-lg p-4 text-left">
            <div className="flex items-center gap-3 mb-2">
              <div className="w-2 h-2 bg-yellow-400 rounded-full"></div>
              <h3 className="text-white font-semibold">Security Alert</h3>
              <span className="text-gray-400 text-sm ml-auto">3 days ago</span>
            </div>
            <p className="text-gray-400 text-sm">New login detected from a different device.</p>
          </div>
        </div>
      </div>
    </div>
  );

  const renderSettingContent = () => (
    <div className="space-y-6">
      <div className="bg-slate-800 border border-gray-600 rounded-2xl p-8">
        <div className="flex items-center gap-4 mb-6">
          <Settings className="w-12 h-12 text-emerald-400" />
          <div>
            <h2 className="text-2xl font-bold text-white">Settings</h2>
            <p className="text-gray-400">Configure your application preferences</p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-white">Preferences</h3>
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-gray-300">Email Notifications</span>
                <div className="w-12 h-6 bg-emerald-500 rounded-full relative">
                  <div className="w-5 h-5 bg-white rounded-full absolute top-0.5 right-0.5"></div>
                </div>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-gray-300">Dark Mode</span>
                <div className="w-12 h-6 bg-emerald-500 rounded-full relative">
                  <div className="w-5 h-5 bg-white rounded-full absolute top-0.5 right-0.5"></div>
                </div>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-gray-300">Auto-Save</span>
                <div className="w-12 h-6 bg-gray-600 rounded-full relative">
                  <div className="w-5 h-5 bg-white rounded-full absolute top-0.5 left-0.5"></div>
                </div>
              </div>
            </div>
          </div>
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-white">Security</h3>
            <div className="space-y-3">
              <button className="w-full bg-slate-700 hover:bg-slate-600 rounded-lg p-3 text-white text-left transition-colors">
                Change Password
              </button>
              <button className="w-full bg-slate-700 hover:bg-slate-600 rounded-lg p-3 text-white text-left transition-colors">
                Two-Factor Authentication
              </button>
              <button className="w-full bg-slate-700 hover:bg-slate-600 rounded-lg p-3 text-white text-left transition-colors">
                Login History
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  // if (!user) {
  //   navigate('/login');
  //   return null;
  // }

  return (
    <div className="flex h-screen bg-gray-900 text-white">
      {/* Sidebar */}
      <aside className="w-64 bg-gray-900 border-r border-gray-700 p-6 flex flex-col justify-between">
        <div>
          {/* Logo */}
          <div className="flex items-center gap-3 mb-10">
            <Link to="/" className="flex items-center gap-3">
              <div className="w-10 h-10 bg-gray-800 rounded-lg flex items-center justify-center">
                <BarChart3 className="w-6 h-6 text-[#2CFF05]" />
              </div>
              <span className="text-2xl font-bold text-white">Penta</span>
            </Link>
          </div>

          {/* Navigation */}
          <nav>
            <Link
              to="/dashboard"
              className={`nav-item ${currentPage === 'dashboard' ? 'active' : ''}`}
            >
              <LayoutDashboard />
              <span>Dashboard</span>
            </Link>
            <Link
              to="/transactions"
              className={`nav-item ${currentPage === 'transactions' ? 'active' : ''}`}
            >
              <CreditCard />
              <span>Transactions</span>
            </Link>
            <Link
              to="/wallet"
              className={`nav-item ${currentPage === 'wallet' ? 'active' : ''}`}
            >
              <Wallet />
              <span>Wallet</span>
            </Link>
            <Link
              to="/analytics"
              className={`nav-item ${currentPage === 'analytics' ? 'active' : ''}`}
            >
              <BarChart3 />
              <span>Analytics</span>
            </Link>
            <Link
              to="/personal"
              className={`nav-item ${currentPage === 'personal' ? 'active' : ''}`}
            >
              <User />
              <span>Personal</span>
            </Link>
            <Link
              to="/message"
              className={`nav-item ${currentPage === 'message' ? 'active' : ''}`}
            >
              <MessageSquare />
              <span>Message</span>
            </Link>
            <Link
              to="/setting"
              className={`nav-item ${currentPage === 'setting' ? 'active' : ''}`}
            >
              <Settings />
              <span>Setting</span>
            </Link>
          </nav>
        </div>
      </aside>

      {/* Main Content */}
      <main className="main-content">
        {/* Header */}
        <header className="header">
          <h1 className="header-title">
            {currentPage === 'dashboard' ? 'Dashboard' :
              currentPage === 'transactions' ? 'Transactions' :
                currentPage === 'wallet' ? 'Wallet' :
                  currentPage === 'analytics' ? 'Analytics' :
                    currentPage === 'personal' ? 'Personal' :
                      currentPage === 'message' ? 'Messages' :
                        currentPage === 'setting' ? 'Settings' : 'Dashboard'}
          </h1>

          <div className="header-search">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-500" />
              <input
                type="text"
                placeholder="Search for anything..."
                value={searchTerm}
                onChange={(e) => handleSearch(e.target.value)}
                className="w-full bg-gray-800 border border-gray-700 rounded-md py-2 px-4 text-white focus:outline-none focus:ring-2 focus:ring-[#2CFF05]/50 pl-10"
              />
            </div>
          </div>

          <div className="header-actions">
            <Bell className="notification-icon" />
            <div
              className="user-avatar"
              onClick={handleLogout}
              title="Click to logout"
            >
              {getInitials(user.firstName, user.lastName)}
            </div>
          </div>
        </header>

        {/* Dashboard Content */}
        <div className="dashboard-content">
          {renderPageContent()}
        </div>
      </main>

      {/* Export Modal */}
      {showExport && (
        <CSVExport
          transactions={transactions}
          filters={filters}
          onClose={() => setShowExport(false)}
        />
      )}
    </div>
  );
};

export default Dashboard; 