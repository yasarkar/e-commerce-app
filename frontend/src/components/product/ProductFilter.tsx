import React, { useState } from 'react';
import type { Category, ProductFilterParams } from '../../types';
import { Filter, Trash2, ChevronDown } from 'lucide-react';

interface ProductFilterProps {
  filters: ProductFilterParams;
  onChange: (filters: ProductFilterParams) => void;
  categories: Category[];
}

export const ProductFilter: React.FC<ProductFilterProps> = ({ filters, onChange, categories }) => {
  const [isCategoryDropdownOpen, setIsCategoryDropdownOpen] = useState(false);

  const selectedCategory = categories.find((c) => c.id === filters.categoryId);
  const selectedCategoryName = selectedCategory ? selectedCategory.name : 'Tüm Kategoriler';

  const handleCategoryChange = (categoryId: string) => {
    onChange({
      ...filters,
      categoryId: filters.categoryId === categoryId ? undefined : categoryId,
      page: 0,
    });
  };

  const handlePriceChange = (e: React.ChangeEvent<HTMLInputElement>, type: 'min' | 'max') => {
    let val = e.target.value ? Number(e.target.value) : undefined;
    if (type === 'min' && val !== undefined && val < 0) {
      val = 0;
    }
    onChange({
      ...filters,
      [type === 'min' ? 'minPrice' : 'maxPrice']: val,
      page: 0,
    });
  };

  const handleStockChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    onChange({
      ...filters,
      inStockOnly: e.target.checked ? true : undefined,
      page: 0,
    });
  };

  const handleSortChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const val = e.target.value;
    if (val === 'price_asc') {
      onChange({ ...filters, sortBy: 'price', sortDirection: 'asc', page: 0 });
    } else if (val === 'price_desc') {
      onChange({ ...filters, sortBy: 'price', sortDirection: 'desc', page: 0 });
    } else if (val === 'newest') {
      onChange({ ...filters, sortBy: 'id', sortDirection: 'desc', page: 0 });
    } else {
      onChange({ ...filters, sortBy: undefined, sortDirection: undefined, page: 0 });
    }
  };

  const handleReset = () => {
    onChange({
      searchQuery: filters.searchQuery,
      categoryId: undefined,
      minPrice: undefined,
      maxPrice: undefined,
      inStockOnly: undefined,
      sortBy: undefined,
      sortDirection: undefined,
      page: 0,
    });
  };

  const selectedSort =
    filters.sortBy === 'price'
      ? filters.sortDirection === 'asc'
        ? 'price_asc'
        : 'price_desc'
      : filters.sortBy === 'id' && filters.sortDirection === 'desc'
      ? 'newest'
      : '';

  return (
    <div className="bg-slate-800 rounded-xl p-6 border border-slate-700 space-y-6">
      <div className="flex items-center justify-between border-b border-slate-700 pb-4">
        <h3 className="text-slate-900 font-bold text-lg flex items-center space-x-2">
          <Filter className="w-5 h-5 text-indigo-600" />
          <span>Filtreler</span>
        </h3>
        <button
          onClick={handleReset}
          className="text-xs text-slate-400 hover:text-red-600 flex items-center space-x-1 transition-colors cursor-pointer"
        >
          <Trash2 className="w-3.5 h-3.5" />
          <span>Temizle</span>
        </button>
      </div>

      <div className="relative">
        <label className="block text-slate-900 text-sm font-semibold mb-2">
          Kategoriler
        </label>
        <button
          type="button"
          onClick={() => setIsCategoryDropdownOpen(!isCategoryDropdownOpen)}
          className="w-full bg-slate-900 border border-slate-700 rounded-lg py-2.5 px-3 text-slate-800 focus:outline-none focus:border-indigo-500 text-sm flex items-center justify-between cursor-pointer"
        >
          <span className="font-medium text-slate-900">{selectedCategoryName}</span>
          <ChevronDown className={`w-4 h-4 text-slate-500 transition-transform ${isCategoryDropdownOpen ? 'rotate-180' : ''}`} />
        </button>

        {isCategoryDropdownOpen && (
          <div className="absolute left-0 right-0 mt-1 bg-white border border-slate-700 rounded-lg shadow-xl z-20 max-h-80 overflow-y-auto divide-y divide-slate-750">
            <button
              onClick={() => {
                onChange({ ...filters, categoryId: undefined, page: 0 });
                setIsCategoryDropdownOpen(false);
              }}
              className="w-full text-left py-2.5 px-3 hover:bg-slate-855 border border-slate-700 text-sm text-slate-900 font-medium cursor-pointer"
            >
              Tüm Kategoriler
            </button>
            {categories.map((category) => (
              <button
                key={category.id}
                onClick={() => {
                  handleCategoryChange(category.id);
                  setIsCategoryDropdownOpen(false);
                }}
                className={`w-full text-left py-2.5 px-3 hover:bg-slate-855 border border-slate-700 text-sm cursor-pointer ${
                  filters.categoryId === category.id
                    ? 'bg-indigo-50 text-indigo-650 font-bold'
                    : 'text-slate-900 font-medium'
                }`}
              >
                {category.name}
              </button>
            ))}
          </div>
        )}
      </div>

      <div>
        <label className="block text-slate-300 text-sm font-semibold mb-3">
          Fiyat Aralığı (TL)
        </label>
        <div className="flex items-center space-x-2">
          <input
            type="number"
            placeholder="Min"
            min="0"
            value={filters.minPrice ?? ''}
            onChange={(e) => handlePriceChange(e, 'min')}
            className="w-full bg-slate-900 border border-slate-700 rounded-lg py-2 px-3 text-slate-800 placeholder-slate-400 focus:outline-none focus:border-indigo-500 text-sm"
          />
          <span className="text-slate-500">—</span>
          <input
            type="number"
            placeholder="Max"
            value={filters.maxPrice ?? ''}
            onChange={(e) => handlePriceChange(e, 'max')}
            className="w-full bg-slate-900 border border-slate-700 rounded-lg py-2 px-3 text-slate-800 placeholder-slate-400 focus:outline-none focus:border-indigo-500 text-sm"
          />
        </div>
      </div>

      <div className="flex items-center space-x-3 py-1">
        <input
          id="inStockOnly"
          type="checkbox"
          checked={!!filters.inStockOnly}
          onChange={handleStockChange}
          className="w-4 h-4 text-indigo-600 border-slate-700 rounded focus:ring-indigo-500 bg-slate-900 cursor-pointer"
        />
        <label htmlFor="inStockOnly" className="text-slate-300 text-sm font-medium select-none cursor-pointer">
          Sadece Stoktakiler
        </label>
      </div>

      <div>
        <label className="block text-slate-300 text-sm font-semibold mb-2">
          Sıralama Seçenekleri
        </label>
        <select
          value={selectedSort}
          onChange={handleSortChange}
          className="w-full bg-slate-900 border border-slate-700 rounded-lg py-2.5 px-3 text-slate-800 focus:outline-none focus:border-indigo-500 text-sm cursor-pointer"
        >
          <option value="">Varsayılan</option>
          <option value="price_asc">Fiyat: Düşükten Yükseğe</option>
          <option value="price_desc">Fiyat: Yüksekten Düşüğe</option>
          <option value="newest">En Yeniler</option>
        </select>
      </div>
    </div>
  );
};
