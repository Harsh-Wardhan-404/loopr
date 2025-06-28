import React, { useState } from 'react';
import { Eye, Edit, ChevronUp, ChevronDown, Loader, FileX } from 'lucide-react';
import type { Transaction, SortConfig } from '../types';
import { dataUtils } from '../services/api';

interface TransactionTableProps {
  transactions: Transaction[];
  loading: boolean;
  sortConfig: SortConfig;
  onSortChange: (sortConfig: SortConfig) => void;
}

const TransactionTable: React.FC<TransactionTableProps> = ({
  transactions,
  loading,
  sortConfig,
  onSortChange,
}) => {
  const [imageErrors, setImageErrors] = useState<Set<string>>(new Set());

  const handleSort = (key: keyof Transaction) => {
    let direction: 'asc' | 'desc' = 'asc';
    
    if (sortConfig.key === key && sortConfig.direction === 'asc') {
      direction = 'desc';
    }
    
    onSortChange({ key, direction });
  };

  const getSortIcon = (key: keyof Transaction) => {
    if (sortConfig.key !== key) {
      return <ChevronUp className="sort-icon" />;
    }
    
    return sortConfig.direction === 'asc' 
      ? <ChevronUp className="sort-icon active" />
      : <ChevronDown className="sort-icon active" />;
  };

  const handleViewTransaction = (transaction: Transaction) => {
    // Navigate to transaction detail or open modal
    console.log('View transaction:', transaction);
  };

  const handleEditTransaction = (transaction: Transaction) => {
    // Navigate to edit form or open modal
    console.log('Edit transaction:', transaction);
  };

  const formatCurrency = (amount: number) => {
    return dataUtils.formatCurrency(amount);
  };

  const formatDate = (dateString: string) => {
    return dataUtils.formatDate(dateString);
  };

  const truncateText = (text: string | undefined | null, maxLength: number = 30): string => {
    if (!text) return 'N/A';
    return text.length > maxLength ? `${text.substring(0, maxLength)}...` : text;
  };

  const safeSliceId = (id: string | undefined | null, length: number = 8): string => {
    if (!id || typeof id !== 'string') return 'N/A';
    return id.length > length ? id.slice(-length) : id;
  };

  const safeLowerCase = (text: string | undefined | null): string => {
    if (!text || typeof text !== 'string') return '';
    return text.toLowerCase();
  };

  const handleImageError = (transactionId: string) => {
    setImageErrors(prev => new Set(prev).add(transactionId));
  };

  const renderProfileAvatar = (transaction: Transaction) => {
    const hasValidImage = transaction.user_profile && !imageErrors.has(transaction._id);
    const displayName = transaction.user_name || `User ${transaction.user_id}`;
    
    if (hasValidImage) {
      return (
        <img
          src={transaction.user_profile}
          alt={displayName}
          className="w-10 h-10 rounded-full object-cover"
          onError={() => handleImageError(transaction._id)}
        />
      );
    }
    
    // Fallback to gradient avatar with first letter
    return (
      <div className="w-10 h-10 rounded-full bg-gradient-to-r from-blue-400 to-purple-500 flex items-center justify-center text-white font-semibold text-sm">
        {displayName.charAt(0).toUpperCase()}
      </div>
    );
  };

  if (loading) {
    return (
      <div className="table-loading">
        <Loader className="loading-spinner" />
        <h3>Loading transactions...</h3>
        <p>Please wait while we fetch your data</p>
      </div>
    );
  }

  if (transactions.length === 0) {
    return (
      <div className="table-empty">
        <FileX className="empty-icon" />
        <h3>No transactions found</h3>
        <p>Try adjusting your filters or search criteria to find transactions.</p>
      </div>
    );
  }

  return (
    <div className="table-wrapper">
      <table className="transactions-table">
        <thead>
          <tr>
            <th>
              <button
                onClick={() => handleSort('description')}
                className="sort-button"
              >
                Name {getSortIcon('description')}
              </button>
            </th>
            <th>
              <button
                onClick={() => handleSort('date')}
                className="sort-button"
              >
                Date {getSortIcon('date')}
              </button>
            </th>
            <th>
              <button
                onClick={() => handleSort('amount')}
                className="sort-button"
              >
                Amount {getSortIcon('amount')}
              </button>
            </th>
            <th>
              <button
                onClick={() => handleSort('status')}
                className="sort-button"
              >
                Status {getSortIcon('status')}
              </button>
            </th>
          </tr>
        </thead>
        <tbody>
          {transactions.map((transaction) => (
            <tr key={transaction._id}>
              {/* Name Column with Profile Photo */}
              <td className="name-cell">
                <div className="flex items-center gap-3">
                  {renderProfileAvatar(transaction)}
                  <div>
                    <div className="text-white font-medium text-sm">
                      {transaction.user_name || `User ${transaction.user_id}`}
                    </div>
                    <div className="text-gray-400 text-xs">
                      {truncateText(transaction.description, 20)}
                    </div>
                  </div>
                </div>
              </td>

              {/* Date Column */}
              <td className="date-cell">
                {formatDate(transaction.date)}
              </td>

              {/* Amount Column */}
              <td>
                <span className={`table-amount ${
                  transaction.category === 'Revenue' ? 'positive' : 'negative'
                }`}>
                  {transaction.category === 'Revenue' ? '+' : '-'}{formatCurrency(transaction.amount)}
                </span>
              </td>

              {/* Status Column */}
              <td>
                <span className={`status-badge ${safeLowerCase(transaction.status)}`}>
                  {transaction.status === 'Paid' ? 'Completed' : transaction.status}
                </span>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default TransactionTable; 