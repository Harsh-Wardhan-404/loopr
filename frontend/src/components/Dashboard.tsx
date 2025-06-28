import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
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
  const [user] = useState(() => {
    const userData = localStorage.getItem('user');
    return userData ? JSON.parse(userData) : null;
  });

  // State management
  const [analytics, setAnalytics] = useState<AnalyticsData | null>(null);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState<Partial<FilterType>>({});
  const [sortConfig, setSortConfig] = useState<SortConfig>({ key: 'date', direction: 'desc' });
  const [pagination, setPagination] = useState<PaginationConfig>({
    page: 1,
    limit: 10,
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
      Income: item.income,
      Expenses: item.expenses,
    }));

    switch (timePeriod) {
      case 'weekly':
        // Transform monthly data to weekly data (simulate 4 weeks per month)
        const weeklyData: Array<{ month: string; Income: number; Expenses: number }> = [];
        baseData.slice(-3).forEach((monthData, monthIndex) => {
          const weeksInMonth = 4;
          for (let week = 1; week <= weeksInMonth; week++) {
            weeklyData.push({
              month: `${monthData.month} W${week}`,
              Income: Math.round((monthData.Income / weeksInMonth) * (0.8 + Math.random() * 0.4)), // Add some variation
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
          
          const totalIncome = yearData.reduce((sum, month) => sum + month.Income, 0);
          const totalExpenses = yearData.reduce((sum, month) => sum + month.Expenses, 0);
          
          return {
            month: year.toString(),
            Income: totalIncome,
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
  const recentTransactions = analytics?.recentTransactions?.slice(0, 3) || [];

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

  if (!user) {
    navigate('/login');
    return null;
  }

  return (
    <div className="dashboard-layout">
      {/* Sidebar */}
      <aside className="sidebar">
        <div className="sidebar-logo">
          <div className="w-8 h-8 bg-emerald-500 rounded-lg flex items-center justify-center">
            <BarChart3 className="w-5 h-5 text-white" />
          </div>
          <h1>Penta</h1>
        </div>

        <nav className="sidebar-nav">
          <Link to="/dashboard" className="nav-item active">
            <LayoutDashboard />
            <span>Dashboard</span>
          </Link>
          <Link to="/transactions" className="nav-item">
            <CreditCard />
            <span>Transactions</span>
          </Link>
          <Link to="/wallet" className="nav-item">
            <Wallet />
            <span>Wallet</span>
          </Link>
          <Link to="/analytics" className="nav-item">
            <BarChart3 />
            <span>Analytics</span>
          </Link>
          <Link to="/personal" className="nav-item">
            <User />
            <span>Personal</span>
          </Link>
          <Link to="/message" className="nav-item">
            <MessageSquare />
            <span>Message</span>
          </Link>
          <Link to="/setting" className="nav-item">
            <Settings />
            <span>Setting</span>
          </Link>
        </nav>
      </aside>

      {/* Main Content */}
      <main className="main-content">
        {/* Header */}
        <header className="header">
          <h1 className="header-title">Dashboard</h1>
          
          <div className="header-search">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-500" />
              <input
                type="text"
                placeholder="Search for anything..."
                value={searchTerm}
                onChange={(e) => handleSearch(e.target.value)}
                className="search-input pl-10"
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
          {/* Stats Grid */}
          <div className="stats-grid">
            <div className="stat-card">
              <div className="stat-icon income">
                <TrendingUp className="w-6 h-6" />
              </div>
              <div className="stat-info">
                <h3>Income</h3>
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
                    Income
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
                        dataKey="Income" 
                        stroke="#10B981" 
                        strokeWidth={3}
                        dot={{ fill: '#10B981', strokeWidth: 2, r: 4 }}
                        activeDot={{ r: 6, stroke: '#10B981', strokeWidth: 2 }}
                      />
                    )}
                    {(chartView === 'expenses' || chartView === 'both') && (
                      <Line 
                        type="monotone" 
                        dataKey="Expenses" 
                        stroke="#F59E0B" 
                        strokeWidth={3}
                        dot={{ fill: '#F59E0B', strokeWidth: 2, r: 4 }}
                        activeDot={{ r: 6, stroke: '#F59E0B', strokeWidth: 2 }}
                      />
                    )}
                  </LineChart>
                </ResponsiveContainer>
              ) : (
                <div className="flex items-center justify-center h-full">
                  <div className="text-gray-400">No data available for chart</div>
                </div>
              )}
            </div>
          </div>

          {/* Recent Transactions Sidebar */}
          {showRecentTransactions && (
            <div className="fixed right-8 top-32 w-80 bg-slate-800 border border-gray-600 rounded-2xl p-6 shadow-xl z-10">
              <div className="flex justify-between items-center mb-6">
                <h3 className="text-lg font-semibold text-white">Recent Transaction</h3>
                <div className="flex items-center gap-2">
                  <button className="text-emerald-400 text-sm hover:text-emerald-300">
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
                {recentTransactions.map((transaction) => {
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
                            // Fallback to gradient avatar on image error
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
                      <div className={`font-semibold text-sm ${
                        transaction.category === 'Revenue' ? 'text-emerald-400' : 'text-amber-400'
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

          {/* Transactions Section */}
          <div className="table-container">
            <div className="p-6 border-b border-gray-600">
              <div className="flex justify-between items-center">
                <h3 className="text-xl font-semibold text-white">Transactions</h3>
                <div className="flex gap-3">
                  <button
                    onClick={() => setShowFilters(!showFilters)}
                    className="flex items-center gap-2 px-4 py-2 bg-slate-700 text-white rounded-lg hover:bg-slate-600 transition-colors"
                  >
                    <Filter className="w-4 h-4" />
                    Filters
                  </button>
                  <button className="flex items-center gap-2 px-4 py-2 bg-slate-700 text-white rounded-lg hover:bg-slate-600 transition-colors">
                    <Calendar className="w-4 h-4" />
                    10 May - 20 May
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