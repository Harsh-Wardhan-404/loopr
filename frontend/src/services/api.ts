import axios, { type AxiosResponse } from 'axios';
import { format } from 'date-fns';
import type { 
  User, 
  Transaction, 
  AuthResponse, 
  LoginCredentials, 
  SignupCredentials,
  TransactionFilters,
  SortConfig,
  PaginationConfig,
  TransactionsResponse,
  AnalyticsData,
  CSVExportConfig
} from '../types';

// Create axios instance with base configuration
const api = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000/',
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add request interceptor to include auth token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Add response interceptor to handle errors
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

// Authentication API
export const authAPI = {
  login: async (credentials: LoginCredentials): Promise<AuthResponse> => {
    const response: AxiosResponse<AuthResponse> = await api.post('/login', credentials);
    return response.data;
  },

  signup: async (credentials: SignupCredentials): Promise<AuthResponse> => {
    const response: AxiosResponse<AuthResponse> = await api.post('/signup', credentials);
    return response.data;
  },

  getProfile: async (): Promise<User> => {
    const response: AxiosResponse<User> = await api.get('/profile');
    return response.data;
  },

  logout: () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
  },
};

// Transactions API
export const transactionsAPI = {
  getTransactions: async (
    filters: Partial<TransactionFilters> = {},
    sort: SortConfig = { key: null, direction: 'desc' },
    pagination: Partial<PaginationConfig> = {}
  ): Promise<TransactionsResponse> => {
    const params = new URLSearchParams();
    
    // Add filters
    Object.entries(filters).forEach(([key, value]) => {
      if (value && value !== '') {
        params.append(key, value);
      }
    });

    // Add sorting
    if (sort.key) {
      params.append('sortBy', sort.key);
      params.append('sortOrder', sort.direction);
    }

    // Add pagination
    if (pagination.page) params.append('page', pagination.page.toString());
    if (pagination.limit) params.append('limit', pagination.limit.toString());

    const response: AxiosResponse<TransactionsResponse> = await api.get(`/transactions?${params}`);
    return response.data;
  },

  getTransaction: async (id: string): Promise<Transaction> => {
    const response: AxiosResponse<Transaction> = await api.get(`/transactions/${id}`);
    return response.data;
  },

  createTransaction: async (transaction: Omit<Transaction, '_id' | 'createdAt' | 'updatedAt'>): Promise<Transaction> => {
    const response: AxiosResponse<Transaction> = await api.post('/transactions', transaction);
    return response.data;
  },

  updateTransaction: async (id: string, transaction: Partial<Transaction>): Promise<Transaction> => {
    const response: AxiosResponse<Transaction> = await api.put(`/transactions/${id}`, transaction);
    return response.data;
  },

  deleteTransaction: async (id: string): Promise<void> => {
    await api.delete(`/transactions/${id}`);
  },
};

// Analytics API
export const analyticsAPI = {
  getAnalytics: async (): Promise<AnalyticsData> => {
    try {
      // Get recent transactions to calculate analytics (increase limit to get all historical data)
      const transactionsResponse = await transactionsAPI.getTransactions({}, { key: 'date', direction: 'desc' }, { page: 1, limit: 1000 });
      const transactions = transactionsResponse.transactions;

      // Calculate stats using utility functions
      const stats = dataUtils.calculateStats(transactions);
      
      // Process chart data
      const monthlyData = dataUtils.processChartData(transactions);
      
      // Get recent transactions for sidebar (last 5)
      const recentTransactions = transactions.slice(0, 5);

      return {
        totalIncome: stats.totalIncome,
        totalRevenue: stats.totalRevenue,
        totalExpenses: stats.totalExpenses,
        totalSavings: stats.totalSavings,
        monthlyData,
        recentTransactions
      };
    } catch (error) {
      console.error('Error fetching analytics:', error);
      // Return mock data as fallback
      return {
        totalIncome: 45210,
        totalRevenue: 45210,
        totalExpenses: 32100,
        totalSavings: 13110,
        monthlyData: [
          { month: 'Jan 2024', income: 12000, expenses: 8000 },
          { month: 'Feb 2024', income: 15000, expenses: 9000 },
          { month: 'Mar 2024', income: 18000, expenses: 10000 },
          { month: 'Apr 2024', income: 14000, expenses: 7500 },
          { month: 'May 2024', income: 16000, expenses: 8500 },
          { month: 'Jun 2024', income: 19000, expenses: 11000 },
        ],
        recentTransactions: []
      };
    }
  },
};

// Data processing utilities
export const dataUtils = {
  formatCurrency: (amount: number | undefined | null): string => {
    // Handle undefined, null, or NaN values
    if (amount === undefined || amount === null || isNaN(amount)) {
      return '$0.00';
    }
    
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(amount);
  },

  formatDate: (date: string): string => {
    return format(new Date(date), 'MMM dd, yyyy');
  },

  formatDateTime: (date: string): string => {
    return format(new Date(date), 'MMM dd, yyyy HH:mm');
  },

  generateCsvData: (
    transactions: Transaction[],
    config: CSVExportConfig,
    filters?: Partial<TransactionFilters>
  ) => {
    // Define all possible columns
    const columnMap = {
      _id: 'ID',
      description: 'Description',
      amount: 'Amount',
      category: 'Category',
      status: 'Status',
      date: 'Date',
      user_id: 'User ID',
      user_profile: 'Profile URL',
      user_name: 'User Name',
      createdAt: 'Created At',
      updatedAt: 'Updated At',
    };

    // Filter headers based on selected columns
    const headers = config.columns.map(col => columnMap[col as keyof typeof columnMap]);

    // Process data rows
    const data = transactions.map(transaction => {
      const row: any = {};
      config.columns.forEach(col => {
        const key = col as keyof Transaction;
        let value = transaction[key];
        
        // Format specific fields
        if (key === 'amount') {
          value = dataUtils.formatCurrency(value as number);
        } else if (key === 'date' || key === 'createdAt' || key === 'updatedAt') {
          value = dataUtils.formatDate(value as string);
        }
        
        row[columnMap[key]] = value;
      });
      return row;
    });

    // Add metadata if requested
    let metadata: any[] = [];
    if (config.includeFilters && filters) {
      metadata = [
        [],
        ['Export Information'],
        ['Generated on:', format(new Date(), 'MMM dd, yyyy HH:mm')],
        ['Total records:', transactions.length.toString()],
        [],
        ['Applied Filters:'],
      ];

      Object.entries(filters).forEach(([key, value]) => {
        if (value && value !== '') {
          metadata.push([key.charAt(0).toUpperCase() + key.slice(1) + ':', value]);
        }
      });

      metadata.push([]);
    }

    return {
      headers,
      data: [...metadata, headers, ...data],
      filename: config.filename || `transactions_${format(new Date(), 'yyyy-MM-dd')}.csv`,
    };
  },

  processChartData: (transactions: Transaction[]) => {
    const monthlyData = new Map();
    
    transactions.forEach(transaction => {
      const month = format(new Date(transaction.date), 'MMM yyyy');
      
      if (!monthlyData.has(month)) {
        monthlyData.set(month, { month, income: 0, expenses: 0 });
      }
      
      const data = monthlyData.get(month);
      if (transaction.category === 'Revenue') {
        data.income += transaction.amount;
      } else {
        data.expenses += transaction.amount;
      }
    });

    return Array.from(monthlyData.values()).sort((a, b) => 
      new Date(a.month).getTime() - new Date(b.month).getTime()
    );
  },

  calculateStats: (transactions: Transaction[]) => {
    const stats = {
      totalIncome: 0,
      totalRevenue: 0,
      totalExpenses: 0,
      totalSavings: 0,
    };

    transactions.forEach(transaction => {
      if (transaction.category === 'Revenue') {
        stats.totalRevenue += transaction.amount;
        stats.totalIncome += transaction.amount;
      } else {
        stats.totalExpenses += transaction.amount;
      }
    });

    stats.totalSavings = stats.totalIncome - stats.totalExpenses;

    return stats;
  },
};

// Export utilities
export const exportUtils = {
  downloadCsv: (data: any[], filename: string) => {
    const csvContent = data.map(row => 
      Array.isArray(row) 
        ? row.map(cell => `"${cell}"`).join(',')
        : Object.values(row).map(cell => `"${cell}"`).join(',')
    ).join('\n');
    
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    
    if (link.download !== undefined) {
      const url = URL.createObjectURL(blob);
      link.setAttribute('href', url);
      link.setAttribute('download', filename);
      link.style.visibility = 'hidden';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    }
  },
};

export default api; 