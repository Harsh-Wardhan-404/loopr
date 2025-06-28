export interface User {
  _id: string;
  email: string;
  firstName: string;
  lastName: string;
  createdAt: string;
  updatedAt: string;
}

export interface Transaction {
  _id: string;
  user_id: string;
  amount: number;
  description: string;
  category: 'Revenue' | 'Expense';
  status: 'Paid' | 'Pending';
  date: string;
  user_profile?: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface AuthResponse {
  token: string;
  user: User;
}

export interface LoginCredentials {
  email: string;
  password: string;
}

export interface SignupCredentials {
  firstName: string;
  lastName: string;
  email: string;
  password: string;
}

export interface TransactionFilters {
  search: string;
  category: string;
  status: string;
  dateFrom: string;
  dateTo: string;
  amountMin: string;
  amountMax: string;
  userId: string;
}

export interface SortConfig {
  key: keyof Transaction | null;
  direction: 'asc' | 'desc';
}

export interface PaginationConfig {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

export interface TransactionsResponse {
  transactions: Transaction[];
  pagination: PaginationConfig;
}

export interface AnalyticsData {
  totalIncome: number;
  totalRevenue: number;
  totalExpenses: number;
  totalSavings: number;
  monthlyData: Array<{
    month: string;
    income: number;
    expenses: number;
  }>;
  recentTransactions: Transaction[];
}

export interface ApiError {
  message: string;
  status: number;
}

export interface CSVExportConfig {
  filename: string;
  columns: string[];
  includeFilters: boolean;
} 