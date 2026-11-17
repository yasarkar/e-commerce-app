import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { adminStockService } from '../../api/adminStockService';
import { useToast } from '../../context/ToastContext';
import type { StockMovement, StockMovementType } from '../../types';
import { Pagination } from '../../components/common/Pagination';
import { Search, RefreshCw, History, X, Filter, CalendarDays } from 'lucide-react';

const TYPE_LABELS: Record<StockMovementType, string> = {
  SALE: 'Satış',
  CANCEL: 'İptal',
  RESTOCK: 'Stok Girişi',
  ADJUSTMENT: 'Düzeltme',
};

const TYPE_STYLES: Record<StockMovementType, string> = {
  SALE: 'bg-red-500/10 border-red-500/30 text-red-400',
  CANCEL: 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400',
  RESTOCK: 'bg-blue-500/10 border-blue-500/30 text-blue-400',
  ADJUSTMENT: 'bg-amber-500/10 border-amber-500/30 text-amber-400',
};

const formatDate = (iso: string) => {
  const d = new Date(iso);
  return d.toLocaleString('tr-TR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
};

const getChangeDisplay = (movement: StockMovement) => {
  const change = movement.quantityChange;
  const isNegative = change < 0;
  const isPositive = change > 0;

  if (isNegative) {
    return <span className="font-bold text-red-400">{change}</span>;
  }
  if (isPositive) {
    return <span className="font-bold text-emerald-400">+{change}</span>;
  }
  return <span className="font-bold text-slate-400">0</span>;
};

export const AdminStockMovements: React.FC = () => {
  const { showToast } = useToast();
  const [movements, setMovements] = useState<StockMovement[]>([]);
  const [currentPage, setCurrentPage] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [isLoading, setIsLoading] = useState(true);

  // Filters
  const [productSearch, setProductSearch] = useState('');
  const [typeFilter, setTypeFilter] = useState<StockMovementType | ''>('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');

  const fetchMovements = useCallback(async (page: number, params?: { productSearch?: string; type?: StockMovementType | ''; startDate?: string; endDate?: string }) => {
    setIsLoading(true);
    try {
      const filters: any = {
        page,
        size: 15,
      };
      if (params?.productSearch) filters.productSearch = params.productSearch;
      if (params?.type) filters.type = params.type;
      if (params?.startDate) filters.startDate = params.startDate;
      if (params?.endDate) filters.endDate = params.endDate;

      const response = await adminStockService.getMovements(filters);
      setMovements(response.data.content);
      setTotalPages(response.data.totalPages);
      setCurrentPage(response.data.number);
    } catch (error) {
      console.error('Error fetching stock movements:', error);
      showToast('error', 'Stok hareketleri yüklenirken bir hata oluştu.');
    } finally {
      setIsLoading(false);
    }
  }, [showToast]);

  useEffect(() => {
    fetchMovements(0);
  }, [fetchMovements]);

  const handlePageChange = (page: number) => {
    fetchMovements(page, {
      productSearch,
      type: typeFilter,
      startDate,
      endDate,
    });
  };

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    fetchMovements(0, {
      productSearch,
      type: typeFilter,
      startDate,
      endDate,
    });
  };

  const handleClearFilters = () => {
    setProductSearch('');
    setTypeFilter('');
    setStartDate('');
    setEndDate('');
    fetchMovements(0);
  };

  const hasActiveFilters = useMemo(
    () => productSearch !== '' || typeFilter !== '' || startDate !== '' || endDate !== '',
    [productSearch, typeFilter, startDate, endDate]
  );

  return (
    <div className="space-y-8 animate-fade-in">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-extrabold text-black tracking-tight">Stok Hareketleri</h1>
          <p className="text-slate-400 text-sm mt-1">Tüm stok değişimlerinin denetlenebilir geçmişi.</p>
        </div>
        {hasActiveFilters && (
          <button
            onClick={handleClearFilters}
            className="text-slate-400 hover:text-white text-xs font-semibold px-3 py-2 border border-slate-800 rounded-lg hover:bg-slate-800 transition-colors cursor-pointer flex items-center space-x-1.5"
          >
            <X className="w-3.5 h-3.5" />
            <span>Filtreleri Temizle</span>
          </button>
        )}
      </div>

      {/* Filter Panel */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 flex flex-col lg:flex-row gap-4 items-stretch lg:items-end justify-between">
        <form onSubmit={handleSearchSubmit} className="relative flex-1 max-w-md">
          <input
            type="text"
            placeholder="Ürün adı ara..."
            value={productSearch}
            onChange={(e) => setProductSearch(e.target.value)}
            className="w-full bg-slate-950 text-white border border-slate-800 rounded-lg py-2 pl-4 pr-10 text-sm focus:outline-none focus:border-indigo-600 transition-colors"
          />
          <button type="submit" className="absolute right-3 top-2.5 text-slate-500 hover:text-white cursor-pointer">
            <Search className="w-4 h-4" />
          </button>
        </form>

        <div className="flex flex-wrap items-end gap-3">
          <div>
            <label className="block text-slate-500 text-xs font-semibold mb-1.5">Hareket Türü</label>
            <select
              value={typeFilter}
              onChange={(e) => setTypeFilter(e.target.value as StockMovementType | '')}
              className="bg-slate-950 border border-slate-800 text-slate-300 rounded-lg py-2 px-3.5 text-sm focus:outline-none focus:border-indigo-600 transition-colors"
            >
              <option value="">Tüm Türler</option>
              <option value="SALE">Satış</option>
              <option value="CANCEL">İptal</option>
              <option value="RESTOCK">Stok Girişi</option>
              <option value="ADJUSTMENT">Düzeltme</option>
            </select>
          </div>

          <div>
            <label className="block text-slate-500 text-xs font-semibold mb-1.5">Başlangıç</label>
            <input
              type="date"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              className="bg-slate-950 border border-slate-800 text-slate-300 rounded-lg py-2 px-3 text-sm focus:outline-none focus:border-indigo-600 transition-colors [color-scheme:dark]"
            />
          </div>

          <div>
            <label className="block text-slate-500 text-xs font-semibold mb-1.5">Bitiş</label>
            <input
              type="date"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
              className="bg-slate-950 border border-slate-800 text-slate-300 rounded-lg py-2 px-3 text-sm focus:outline-none focus:border-indigo-600 transition-colors [color-scheme:dark]"
            />
          </div>

          <button
            onClick={() => handleSearchSubmit({ preventDefault: () => {} } as React.FormEvent)}
            disabled={!hasActiveFilters || isLoading}
            className="bg-indigo-650 hover:bg-indigo-600 text-black font-bold py-2 px-5 rounded-lg text-sm transition-colors disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer flex items-center space-x-1.5"
          >
            <Filter className="w-4 h-4" />
            <span>Filtrele</span>
          </button>
        </div>
      </div>

      {/* Movements Table */}
      {isLoading ? (
        <div className="flex flex-col items-center justify-center py-20 bg-slate-900/30 rounded-2xl border border-slate-800">
          <RefreshCw className="w-10 h-10 text-indigo-600 animate-spin" />
          <p className="text-slate-400 text-sm font-semibold mt-4">Hareketler Yükleniyor...</p>
        </div>
      ) : movements.length === 0 ? (
        <div className="bg-slate-900/30 border border-slate-800 rounded-2xl p-16 text-center">
          <History className="w-12 h-12 text-slate-600 mx-auto mb-4" />
          <p className="text-slate-400 text-sm font-medium">Kayıtlı stok hareketi bulunamadı.</p>
          <p className="text-slate-600 text-xs mt-1">Sipariş oluşturma, sipariş iptali veya stok güncellemeleri burada listelenir.</p>
        </div>
      ) : (
        <div className="space-y-6">
          <div className="bg-slate-900 border border-slate-800 rounded-xl overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-slate-850 text-slate-400 text-xs uppercase font-bold border-b border-slate-800">
                    <th className="py-4 px-6">Tarih</th>
                    <th className="py-4 px-6">Ürün</th>
                    <th className="py-4 px-6 text-center">Hareket Türü</th>
                    <th className="py-4 px-6 text-center">Miktar Değişimi</th>
                    <th className="py-4 px-6">Neden</th>
                    <th className="py-4 px-6">İşlemi Yapan</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800 text-sm">
                  {movements.map((movement) => (
                    <tr key={movement.id} className="border border-slate-800 hover:bg-slate-850/50 transition-colors">
                      <td className="py-4 px-6 text-slate-400 whitespace-nowrap">
                        <span className="flex items-center gap-1.5">
                          <CalendarDays className="w-3.5 h-3.5 text-slate-500" />
                          {formatDate(movement.createdAt)}
                        </span>
                      </td>
                      <td className="py-4 px-6">
                        <p className="font-semibold text-black">{movement.productName}</p>
                        <p className="text-slate-500 text-xs mt-0.5">#{movement.productId.slice(-6)}</p>
                      </td>
                      <td className="py-4 px-6 text-center">
                        <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold border ${TYPE_STYLES[movement.type]}`}>
                          {TYPE_LABELS[movement.type]}
                        </span>
                      </td>
                      <td className="py-4 px-6 text-center">
                        {getChangeDisplay(movement)}
                      </td>
                      <td className="py-4 px-6">
                        <span className="text-slate-300">{movement.reason || <span className="text-slate-600">-</span>}</span>
                      </td>
                      <td className="py-4 px-6">
                        <span className="text-slate-400">{movement.performedBy || <span className="text-slate-600">Sistem</span>}</span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          <Pagination
            currentPage={currentPage}
            totalPages={totalPages}
            onPageChange={handlePageChange}
          />
        </div>
      )}
    </div>
  );
};