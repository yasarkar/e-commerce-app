import React from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';

interface PaginationProps {
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
}

export const Pagination: React.FC<PaginationProps> = ({ currentPage, totalPages, onPageChange }) => {
  if (totalPages <= 1) return null;

  const pages = Array.from({ length: totalPages }, (_, i) => i);

  return (
    <div className="flex items-center justify-center space-x-1.5 mt-8">
      <button
        onClick={() => onPageChange(currentPage - 1)}
        disabled={currentPage === 0}
        className="p-2 bg-slate-800 border border-slate-700 rounded-lg text-slate-400 hover:text-indigo-600 hover:border-indigo-600 disabled:opacity-50 disabled:hover:text-slate-400 disabled:hover:border-slate-700 transition-colors cursor-pointer disabled:cursor-not-allowed"
      >
        <ChevronLeft className="w-5 h-5" />
      </button>

      {pages.map((page) => {
        const isActive = page === currentPage;
        return (
          <button
            key={page}
            onClick={() => onPageChange(page)}
            className={`py-2 px-4 rounded-lg text-sm font-bold border transition-colors cursor-pointer ${
              isActive
                ? 'bg-indigo-600 text-white border-indigo-600 shadow-md shadow-indigo-600/10'
                : 'bg-slate-800 border-slate-700 text-slate-400 hover:text-indigo-600 hover:border-indigo-600'
            }`}
          >
            {page + 1}
          </button>
        );
      })}

      <button
        onClick={() => onPageChange(currentPage + 1)}
        disabled={currentPage === totalPages - 1}
        className="p-2 bg-slate-800 border border-slate-700 rounded-lg text-slate-400 hover:text-indigo-600 hover:border-indigo-600 disabled:opacity-50 disabled:hover:text-slate-400 disabled:hover:border-slate-700 transition-colors cursor-pointer disabled:cursor-not-allowed"
      >
        <ChevronRight className="w-5 h-5" />
      </button>
    </div>
  );
};
