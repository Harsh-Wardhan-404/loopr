import React, { useState, useEffect } from 'react';
import { X, Search, Calendar, DollarSign, Filter, RotateCcw } from 'lucide-react';
import type { TransactionFilters as FilterType } from '../types';

interface TransactionFiltersProps {
  filters: Partial<FilterType>;
  onFiltersChange: (filters: Partial<FilterType>) => void;
  onClose: () => void;
}

const TransactionFilters: React.FC<TransactionFiltersProps> = ({
  filters,
  onFiltersChange,
  onClose,
}) => {
  const [localFilters, setLocalFilters] = useState<Partial<FilterType>>(filters);

  useEffect(() => {
    setLocalFilters(filters);
  }, [filters]);

  const handleInputChange = (field: keyof FilterType, value: string) => {
    const updatedFilters = {
      ...localFilters,
      [field]: value,
    };
    setLocalFilters(updatedFilters);
  };

  const handleApplyFilters = () => {
    onFiltersChange(localFilters);
  };

  const handleClearFilters = () => {
    const clearedFilters: Partial<FilterType> = {
      search: '',
      category: '',
      status: '',
      dateFrom: '',
      dateTo: '',
      amountMin: '',
      amountMax: '',
      userId: '',
    };
    setLocalFilters(clearedFilters);
    onFiltersChange(clearedFilters);
  };

  const getActiveFilterCount = () => {
    return Object.values(localFilters).filter(value => value && value !== '').length;
  };

  const getActiveFilterTags = () => {
    const tags: { key: string; label: string; value: string }[] = [];
    
    if (localFilters.search) {
      tags.push({ key: 'search', label: 'Search', value: localFilters.search });
    }
    if (localFilters.category) {
      tags.push({ key: 'category', label: 'Category', value: localFilters.category });
    }
    if (localFilters.status) {
      tags.push({ key: 'status', label: 'Status', value: localFilters.status });
    }
    if (localFilters.dateFrom || localFilters.dateTo) {
      const dateRange = `${localFilters.dateFrom || 'Start'} - ${localFilters.dateTo || 'End'}`;
      tags.push({ key: 'dateRange', label: 'Date Range', value: dateRange });
    }
    if (localFilters.amountMin || localFilters.amountMax) {
      const amountRange = `$${localFilters.amountMin || '0'} - $${localFilters.amountMax || '∞'}`;
      tags.push({ key: 'amountRange', label: 'Amount Range', value: amountRange });
    }
    if (localFilters.userId) {
      tags.push({ key: 'userId', label: 'User ID', value: localFilters.userId });
    }

    return tags;
  };

  const removeFilterTag = (key: string) => {
    const updatedFilters = { ...localFilters };
    
    if (key === 'dateRange') {
      updatedFilters.dateFrom = '';
      updatedFilters.dateTo = '';
    } else if (key === 'amountRange') {
      updatedFilters.amountMin = '';
      updatedFilters.amountMax = '';
    } else {
      updatedFilters[key as keyof FilterType] = '';
    }
    
    setLocalFilters(updatedFilters);
    onFiltersChange(updatedFilters);
  };

  return (
    <div className="bg-slate-700 border-b border-gray-600 p-6">
      <div className="flex justify-between items-center mb-6">
        <div className="flex items-center gap-3">
          <Filter className="w-5 h-5 text-emerald-400" />
          <h3 className="text-lg font-semibold text-white">Advanced Filters</h3>
          {getActiveFilterCount() > 0 && (
            <span className="bg-emerald-500 text-white text-xs px-2 py-1 rounded-full">
              {getActiveFilterCount()}
            </span>
          )}
        </div>
        <button
          onClick={onClose}
          className="text-gray-400 hover:text-white transition-colors"
        >
          <X className="w-5 h-5" />
        </button>
      </div>

      {/* Active Filter Tags */}
      {getActiveFilterTags().length > 0 && (
        <div className="mb-6">
          <div className="text-sm text-gray-400 mb-2">Active Filters:</div>
          <div className="flex flex-wrap gap-2">
            {getActiveFilterTags().map((tag) => (
              <div
                key={tag.key}
                className="bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 px-3 py-1 rounded-full text-sm flex items-center gap-2"
              >
                <span>{tag.label}: {tag.value}</span>
                <button
                  onClick={() => removeFilterTag(tag.key)}
                  className="hover:text-emerald-300"
                >
                  <X className="w-3 h-3" />
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {/* Search */}
        <div>
          <label className="block text-sm font-medium text-gray-300 mb-2">
            Search Transactions
          </label>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-500" />
            <input
              type="text"
              value={localFilters.search || ''}
              onChange={(e) => handleInputChange('search', e.target.value)}
              placeholder="Search description, ID, or amount..."
              className="w-full pl-10 pr-4 py-2 bg-slate-800 border border-gray-600 rounded-lg text-white text-sm focus:outline-none focus:border-emerald-500"
            />
          </div>
        </div>

        {/* Category */}
        <div>
          <label className="block text-sm font-medium text-gray-300 mb-2">
            Category
          </label>
          <select
            value={localFilters.category || ''}
            onChange={(e) => handleInputChange('category', e.target.value)}
            className="w-full px-3 py-2 bg-slate-800 border border-gray-600 rounded-lg text-white text-sm focus:outline-none focus:border-emerald-500"
          >
            <option value="">All Categories</option>
            <option value="Revenue">Revenue</option>
            <option value="Expense">Expense</option>
          </select>
        </div>

        {/* Status */}
        <div>
          <label className="block text-sm font-medium text-gray-300 mb-2">
            Status
          </label>
          <select
            value={localFilters.status || ''}
            onChange={(e) => handleInputChange('status', e.target.value)}
            className="w-full px-3 py-2 bg-slate-800 border border-gray-600 rounded-lg text-white text-sm focus:outline-none focus:border-emerald-500"
          >
            <option value="">All Statuses</option>
            <option value="Paid">Paid</option>
            <option value="Pending">Pending</option>
          </select>
        </div>

        {/* Date From */}
        <div>
          <label className="block text-sm font-medium text-gray-300 mb-2">
            Date From
          </label>
          <div className="relative">
            <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-500" />
            <input
              type="date"
              value={localFilters.dateFrom || ''}
              onChange={(e) => handleInputChange('dateFrom', e.target.value)}
              className="w-full pl-10 pr-4 py-2 bg-slate-800 border border-gray-600 rounded-lg text-white text-sm focus:outline-none focus:border-emerald-500"
            />
          </div>
        </div>

        {/* Date To */}
        <div>
          <label className="block text-sm font-medium text-gray-300 mb-2">
            Date To
          </label>
          <div className="relative">
            <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-500" />
            <input
              type="date"
              value={localFilters.dateTo || ''}
              onChange={(e) => handleInputChange('dateTo', e.target.value)}
              className="w-full pl-10 pr-4 py-2 bg-slate-800 border border-gray-600 rounded-lg text-white text-sm focus:outline-none focus:border-emerald-500"
            />
          </div>
        </div>

        {/* Amount Min */}
        <div>
          <label className="block text-sm font-medium text-gray-300 mb-2">
            Min Amount
          </label>
          <div className="relative">
            <DollarSign className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-500" />
            <input
              type="number"
              value={localFilters.amountMin || ''}
              onChange={(e) => handleInputChange('amountMin', e.target.value)}
              placeholder="0.00"
              min="0"
              step="0.01"
              className="w-full pl-10 pr-4 py-2 bg-slate-800 border border-gray-600 rounded-lg text-white text-sm focus:outline-none focus:border-emerald-500"
            />
          </div>
        </div>

        {/* Amount Max */}
        <div>
          <label className="block text-sm font-medium text-gray-300 mb-2">
            Max Amount
          </label>
          <div className="relative">
            <DollarSign className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-500" />
            <input
              type="number"
              value={localFilters.amountMax || ''}
              onChange={(e) => handleInputChange('amountMax', e.target.value)}
              placeholder="No limit"
              min="0"
              step="0.01"
              className="w-full pl-10 pr-4 py-2 bg-slate-800 border border-gray-600 rounded-lg text-white text-sm focus:outline-none focus:border-emerald-500"
            />
          </div>
        </div>

        {/* User ID */}
        <div>
          <label className="block text-sm font-medium text-gray-300 mb-2">
            User ID
          </label>
          <input
            type="text"
            value={localFilters.userId || ''}
            onChange={(e) => handleInputChange('userId', e.target.value)}
            placeholder="Enter user ID"
            className="w-full px-3 py-2 bg-slate-800 border border-gray-600 rounded-lg text-white text-sm focus:outline-none focus:border-emerald-500"
          />
        </div>
      </div>

      {/* Action Buttons */}
      <div className="flex justify-between items-center mt-6 pt-6 border-t border-gray-600">
        <button
          onClick={handleClearFilters}
          className="flex items-center gap-2 px-4 py-2 text-gray-400 hover:text-white transition-colors"
        >
          <RotateCcw className="w-4 h-4" />
          Clear All Filters
        </button>

        <div className="flex gap-3">
          <button
            onClick={onClose}
            className="px-4 py-2 bg-slate-600 text-white rounded-lg hover:bg-slate-500 transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={handleApplyFilters}
            className="px-4 py-2 bg-emerald-500 text-white rounded-lg hover:bg-emerald-600 transition-colors"
          >
            Apply Filters
          </button>
        </div>
      </div>
    </div>
  );
};

export default TransactionFilters; 