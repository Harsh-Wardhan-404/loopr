import React from 'react';
import { ChevronLeft, ChevronRight, ChevronsLeft, ChevronsRight } from 'lucide-react';
import type { PaginationConfig } from '../types';

interface PaginationProps {
  pagination: PaginationConfig;
  onPageChange: (page: number) => void;
  onLimitChange: (limit: number) => void;
}

const Pagination: React.FC<PaginationProps> = ({
  pagination,
  onPageChange,
  onLimitChange,
}) => {
  // Safely extract pagination values with defaults
  const page = Math.max(1, pagination.page || 1);
  const limit = Math.max(1, pagination.limit || 10);
  const total = Math.max(0, pagination.total || 0);
  const totalPages = Math.max(1, pagination.totalPages || 1);

  // Calculate displayed page numbers
  const getPageNumbers = () => {
    const pages: (number | string)[] = [];
    const showPages = 5; // Number of page buttons to show
    
    if (totalPages <= showPages) {
      // Show all pages if total is small
      for (let i = 1; i <= totalPages; i++) {
        pages.push(i);
      }
    } else {
      // Show smart pagination with ellipsis
      if (page <= 3) {
        // Near the beginning
        for (let i = 1; i <= 4; i++) {
          pages.push(i);
        }
        pages.push('...');
        pages.push(totalPages);
      } else if (page >= totalPages - 2) {
        // Near the end
        pages.push(1);
        pages.push('...');
        for (let i = totalPages - 3; i <= totalPages; i++) {
          pages.push(i);
        }
      } else {
        // In the middle
        pages.push(1);
        pages.push('...');
        for (let i = page - 1; i <= page + 1; i++) {
          pages.push(i);
        }
        pages.push('...');
        pages.push(totalPages);
      }
    }
    
    return pages;
  };

  const handlePageClick = (targetPage: number) => {
    if (targetPage >= 1 && targetPage <= totalPages && targetPage !== page) {
      onPageChange(targetPage);
    }
  };

  const handleLimitChange = (newLimit: number) => {
    onLimitChange(newLimit);
  };

  // Calculate result range with safe math
  const startResult = total > 0 ? (page - 1) * limit + 1 : 0;
  const endResult = total > 0 ? Math.min(page * limit, total) : 0;

  return (
    <div className="flex flex-col sm:flex-row justify-between items-center gap-4">
      {/* Results Info */}
      <div className="text-sm text-gray-400">
        {total > 0 ? (
          <>
            Showing <span className="font-medium text-white">{startResult}</span> to{' '}
            <span className="font-medium text-white">{endResult}</span> of{' '}
            <span className="font-medium text-white">{total}</span> results
          </>
        ) : (
          'No results found'
        )}
      </div>

      {/* Pagination Controls */}
      <div className="flex items-center gap-4">
        {/* Items per page selector */}
        <div className="flex items-center gap-2">
          <span className="text-sm text-gray-400">Show:</span>
          <select
            value={limit}
            onChange={(e) => handleLimitChange(Number(e.target.value))}
            className="bg-slate-700 border border-gray-600 rounded-lg px-3 py-1 text-white text-sm focus:outline-none focus:border-emerald-500"
          >
            <option value={5}>5</option>
            <option value={8}>8</option>
            <option value={15}>15</option>
            <option value={25}>25</option>
          </select>
        </div>

        {/* Page Navigation */}
        {totalPages > 1 && (
          <div className="flex items-center gap-1">
            {/* First Page */}
            <button
              onClick={() => handlePageClick(1)}
              disabled={page === 1}
              className={`
                p-2 rounded-lg transition-colors
                ${page === 1 
                  ? 'text-gray-500 cursor-not-allowed' 
                  : 'text-gray-400 hover:text-white hover:bg-slate-700'
                }
              `}
              title="First page"
            >
              <ChevronsLeft className="w-4 h-4" />
            </button>

            {/* Previous Page */}
            <button
              onClick={() => handlePageClick(page - 1)}
              disabled={page === 1}
              className={`
                p-2 rounded-lg transition-colors
                ${page === 1 
                  ? 'text-gray-500 cursor-not-allowed' 
                  : 'text-gray-400 hover:text-white hover:bg-slate-700'
                }
              `}
              title="Previous page"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>

            {/* Page Numbers */}
            <div className="flex items-center gap-1">
              {getPageNumbers().map((pageNum, index) => {
                if (pageNum === '...') {
                  return (
                    <span
                      key={`ellipsis-${index}`}
                      className="px-3 py-2 text-gray-500"
                    >
                      ...
                    </span>
                  );
                }

                const pageNumber = pageNum as number;
                const isCurrentPage = pageNumber === page;

                return (
                  <button
                    key={pageNumber}
                    onClick={() => handlePageClick(pageNumber)}
                    className={`
                      px-3 py-2 rounded-lg text-sm font-medium transition-colors
                      ${isCurrentPage
                        ? 'bg-emerald-500 text-white'
                        : 'text-gray-400 hover:text-white hover:bg-slate-700'
                      }
                    `}
                  >
                    {pageNumber}
                  </button>
                );
              })}
            </div>

            {/* Next Page */}
            <button
              onClick={() => handlePageClick(page + 1)}
              disabled={page === totalPages}
              className={`
                p-2 rounded-lg transition-colors
                ${page === totalPages 
                  ? 'text-gray-500 cursor-not-allowed' 
                  : 'text-gray-400 hover:text-white hover:bg-slate-700'
                }
              `}
              title="Next page"
            >
              <ChevronRight className="w-4 h-4" />
            </button>

            {/* Last Page */}
            <button
              onClick={() => handlePageClick(totalPages)}
              disabled={page === totalPages}
              className={`
                p-2 rounded-lg transition-colors
                ${page === totalPages 
                  ? 'text-gray-500 cursor-not-allowed' 
                  : 'text-gray-400 hover:text-white hover:bg-slate-700'
                }
              `}
              title="Last page"
            >
              <ChevronsRight className="w-4 h-4" />
            </button>
          </div>
        )}
      </div>

      {/* Mobile-friendly page info */}
      {total > 0 && (
        <div className="sm:hidden text-center">
          <span className="text-sm text-gray-400">
            Page {page} of {totalPages}
          </span>
        </div>
      )}
    </div>
  );
};

export default Pagination; 