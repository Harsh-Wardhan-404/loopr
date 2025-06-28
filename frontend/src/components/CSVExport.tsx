import React, { useState } from 'react';
import { X, Download, Check, FileText, Filter } from 'lucide-react';
import type { Transaction, TransactionFilters, CSVExportConfig } from '../types';
import { dataUtils, exportUtils } from '../services/api';

interface CSVExportProps {
  transactions: Transaction[];
  filters: Partial<TransactionFilters>;
  onClose: () => void;
}

const CSVExport: React.FC<CSVExportProps> = ({
  transactions,
  filters,
  onClose,
}) => {
  const [config, setConfig] = useState<CSVExportConfig>({
    filename: `transactions_${new Date().toISOString().split('T')[0]}`,
    columns: ['description', 'amount', 'category', 'status', 'date'],
    includeFilters: true,
  });
  const [isExporting, setIsExporting] = useState(false);

  // Available columns for export
  const availableColumns = [
    { key: '_id', label: 'Transaction ID', description: 'Unique transaction identifier' },
    { key: 'description', label: 'Description', description: 'Transaction description' },
    { key: 'amount', label: 'Amount', description: 'Transaction amount' },
    { key: 'category', label: 'Category', description: 'Revenue or Expense' },
    { key: 'status', label: 'Status', description: 'Paid or Pending' },
    { key: 'date', label: 'Date', description: 'Transaction date' },
    { key: 'user_id', label: 'User ID', description: 'Associated user identifier' },
    { key: 'createdAt', label: 'Created At', description: 'Record creation timestamp' },
  ];

  const handleColumnToggle = (columnKey: string) => {
    const updatedColumns = config.columns.includes(columnKey)
      ? config.columns.filter(col => col !== columnKey)
      : [...config.columns, columnKey];
    
    setConfig(prev => ({
      ...prev,
      columns: updatedColumns,
    }));
  };

  const handleSelectAll = () => {
    const allColumnKeys = availableColumns.map(col => col.key);
    setConfig(prev => ({
      ...prev,
      columns: allColumnKeys,
    }));
  };

  const handleSelectNone = () => {
    setConfig(prev => ({
      ...prev,
      columns: [],
    }));
  };

  const handleFilenameChange = (filename: string) => {
    setConfig(prev => ({
      ...prev,
      filename,
    }));
  };

  const handleIncludeFiltersToggle = () => {
    setConfig(prev => ({
      ...prev,
      includeFilters: !prev.includeFilters,
    }));
  };

  const getActiveFilters = () => {
    const activeFilters: { [key: string]: string } = {};
    
    Object.entries(filters).forEach(([key, value]) => {
      if (value && value !== '') {
        activeFilters[key] = value;
      }
    });
    
    return activeFilters;
  };

  const handleExport = async () => {
    if (config.columns.length === 0) {
      alert('Please select at least one column to export.');
      return;
    }

    setIsExporting(true);
    
    try {
      // Generate CSV data
      const csvData = dataUtils.generateCsvData(transactions, config, filters);
      
      // Download the file
      exportUtils.downloadCsv(csvData.data, csvData.filename);
      
      // Close modal after successful export
      setTimeout(() => {
        setIsExporting(false);
        onClose();
      }, 1000);
    } catch (error) {
      console.error('Export failed:', error);
      alert('Export failed. Please try again.');
      setIsExporting(false);
    }
  };

  const activeFilters = getActiveFilters();

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-slate-800 border border-gray-600 rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="p-6 border-b border-gray-600">
          <div className="flex justify-between items-center">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-emerald-500/10 rounded-lg flex items-center justify-center">
                <Download className="w-5 h-5 text-emerald-400" />
              </div>
              <div>
                <h2 className="text-xl font-semibold text-white">Export Transactions</h2>
                <p className="text-sm text-gray-400">Configure your CSV export settings</p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-white transition-colors"
            >
              <X className="w-6 h-6" />
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="p-6 space-y-6">
          {/* Export Summary */}
          <div className="bg-slate-700 rounded-lg p-4">
            <div className="flex items-center gap-2 mb-2">
              <FileText className="w-4 h-4 text-emerald-400" />
              <span className="text-sm font-medium text-white">Export Summary</span>
            </div>
            <div className="text-sm text-gray-300">
              <div>Total transactions: <span className="text-white font-medium">{transactions.length}</span></div>
              <div>Selected columns: <span className="text-white font-medium">{config.columns.length}</span></div>
            </div>
          </div>

          {/* Filename Configuration */}
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Filename
            </label>
            <div className="relative">
              <input
                type="text"
                value={config.filename}
                onChange={(e) => handleFilenameChange(e.target.value)}
                className="w-full px-3 py-2 bg-slate-700 border border-gray-600 rounded-lg text-white text-sm focus:outline-none focus:border-emerald-500 pr-12"
                placeholder="Enter filename"
              />
              <span className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 text-sm">
                .csv
              </span>
            </div>
          </div>

          {/* Column Selection */}
          <div>
            <div className="flex justify-between items-center mb-3">
              <label className="text-sm font-medium text-gray-300">
                Select Columns to Export
              </label>
              <div className="flex gap-2">
                <button
                  onClick={handleSelectAll}
                  className="text-xs text-emerald-400 hover:text-emerald-300 transition-colors"
                >
                  Select All
                </button>
                <span className="text-gray-500">|</span>
                <button
                  onClick={handleSelectNone}
                  className="text-xs text-emerald-400 hover:text-emerald-300 transition-colors"
                >
                  Select None
                </button>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {availableColumns.map((column) => (
                <div
                  key={column.key}
                  className={`
                    p-3 rounded-lg border cursor-pointer transition-all
                    ${config.columns.includes(column.key)
                      ? 'border-emerald-500 bg-emerald-500/10'
                      : 'border-gray-600 bg-slate-700 hover:border-gray-500'
                    }
                  `}
                  onClick={() => handleColumnToggle(column.key)}
                >
                  <div className="flex items-start gap-3">
                    <div className={`
                      w-5 h-5 rounded border-2 flex items-center justify-center mt-0.5
                      ${config.columns.includes(column.key)
                        ? 'border-emerald-500 bg-emerald-500'
                        : 'border-gray-600'
                      }
                    `}>
                      {config.columns.includes(column.key) && (
                        <Check className="w-3 h-3 text-white" />
                      )}
                    </div>
                    <div className="flex-1">
                      <div className="text-sm font-medium text-white">{column.label}</div>
                      <div className="text-xs text-gray-400">{column.description}</div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Filter Information */}
          <div>
            <div className="flex items-center gap-2 mb-3">
              <Filter className="w-4 h-4 text-emerald-400" />
              <span className="text-sm font-medium text-gray-300">Applied Filters</span>
              <div className="flex items-center gap-2 ml-auto">
                <input
                  type="checkbox"
                  id="includeFilters"
                  checked={config.includeFilters}
                  onChange={handleIncludeFiltersToggle}
                  className="w-4 h-4 text-emerald-600 rounded border-gray-600 bg-slate-700"
                />
                <label htmlFor="includeFilters" className="text-xs text-gray-400">
                  Include filter info in export
                </label>
              </div>
            </div>

            {Object.keys(activeFilters).length > 0 ? (
              <div className="bg-slate-700 rounded-lg p-3">
                <div className="text-xs text-gray-400 mb-2">Active filters will be applied to export:</div>
                <div className="space-y-1">
                  {Object.entries(activeFilters).map(([key, value]) => (
                    <div key={key} className="flex justify-between text-xs">
                      <span className="text-gray-300 capitalize">{key}:</span>
                      <span className="text-white">{value}</span>
                    </div>
                  ))}
                </div>
              </div>
            ) : (
              <div className="bg-slate-700 rounded-lg p-3 text-center">
                <div className="text-xs text-gray-400">No filters applied - all transactions will be exported</div>
              </div>
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="p-6 border-t border-gray-600">
          <div className="flex justify-between items-center">
            <div className="text-sm text-gray-400">
              {config.columns.length} columns selected
            </div>
            <div className="flex gap-3">
              <button
                onClick={onClose}
                className="px-4 py-2 bg-slate-700 text-white rounded-lg hover:bg-slate-600 transition-colors"
                disabled={isExporting}
              >
                Cancel
              </button>
              <button
                onClick={handleExport}
                disabled={isExporting || config.columns.length === 0}
                className={`
                  px-6 py-2 rounded-lg font-medium transition-colors flex items-center gap-2
                  ${isExporting || config.columns.length === 0
                    ? 'bg-gray-600 text-gray-400 cursor-not-allowed'
                    : 'bg-emerald-500 text-white hover:bg-emerald-600'
                  }
                `}
              >
                {isExporting ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                    Exporting...
                  </>
                ) : (
                  <>
                    <Download className="w-4 h-4" />
                    Export CSV
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CSVExport; 