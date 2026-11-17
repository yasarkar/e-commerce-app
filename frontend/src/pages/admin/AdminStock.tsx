import React, { useState, useEffect, useMemo } from 'react';
import { adminStockService } from '../../api/adminStockService';
import { productService } from '../../api/productService';
import { categoryService } from '../../api/categoryService';
import { useToast } from '../../context/ToastContext';
import type { Product, Category, BulkStockUpdateResult } from '../../types';
import { Pagination } from '../../components/common/Pagination';
import { Search, RefreshCw, X, Boxes } from 'lucide-react';

type StockFilter = 'all' | 'out' | 'in';

interface StockEditRow {
  productId: string;
  newStockQuantity: number;
  reason?: string;
  isDirty: boolean;
}

const getStockBadge = (stock: number) => {
  if (stock <= 0) {
    return <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-semibold bg-red-500/10 border border-red-500/30 text-red-400">Tükendi</span>;
  } else if (stock < 15) {
    return <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-semibold bg-amber-500/10 border border-amber-500/30 text-amber-400">Düşük</span>;
  }
  return <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-semibold bg-emerald-500/10 border border-emerald-500/30 text-emerald-400">Normal</span>;
};

export const AdminStock: React.FC = () => {
  const { showToast } = useToast();
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [currentPage, setCurrentPage] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [isLoading, setIsLoading] = useState(true);

  // Filters
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategoryId, setSelectedCategoryId] = useState('');
  const [stockFilter, setStockFilter] = useState<StockFilter>('all');
  const [filterTrigger, setFilterTrigger] = useState(0);

  // Edit state
  const [editRows, setEditRows] = useState<Record<string, StockEditRow>>({});
  const [isConfirmOpen, setIsConfirmOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const fetchProducts = async (page = 0) => {
    setIsLoading(true);
    try {
      const response = await productService.getProducts({
        page,
        size: 8,
        searchQuery: searchQuery || undefined,
        categoryId: selectedCategoryId || undefined,
      });
      setProducts(response.data.content);
      setTotalPages(response.data.totalPages);
      setCurrentPage(response.data.number);
    } catch (error) {
      console.error('Error fetching products:', error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    const fetchDeps = async () => {
      try {
        const catRes = await categoryService.getAllCategories();
        setCategories(catRes.data);
      } catch (error) {
        console.error('Error loading categories:', error);
      }
    };
    fetchDeps();
  }, []);

  useEffect(() => {
    fetchProducts(0);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filterTrigger, selectedCategoryId]);

  const filteredProducts = useMemo(() => {
    if (stockFilter === 'out') return products.filter((p) => p.stockQuantity <= 0);
    if (stockFilter === 'in') return products.filter((p) => p.stockQuantity > 0);
    return products;
  }, [products, stockFilter]);

  const dirtyRows = useMemo(
    () => Object.values(editRows).filter((row) => row.isDirty),
    [editRows]
  );

  const handlePageChange = (page: number) => {
    fetchProducts(page);
  };

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setFilterTrigger((prev) => prev + 1);
  };

  const getCategoryName = (catId: string) => {
    return categories.find((c) => c.id === catId)?.name || 'Kategorisiz';
  };

  const updateEditRow = (productId: string, field: 'newStockQuantity' | 'reason', value: number | string) => {
    setEditRows((prev) => {
      const product = products.find((p) => p.id === productId);
      const current = prev[productId] ?? {
        productId,
        newStockQuantity: product?.stockQuantity ?? 0,
        isDirty: false,
      };
      const next = { ...current, [field]: value };
      next.isDirty = next.newStockQuantity !== (product?.stockQuantity ?? 0);
      return { ...prev, [productId]: next };
    });
  };

  const resetRow = (productId: string) => {
    setEditRows((prev) => {
      const next = { ...prev };
      delete next[productId];
      return next;
    });
  };

  const clearAllEdits = () => {
    setEditRows({});
  };

  const handleBulkUpdate = async () => {
    if (dirtyRows.length === 0) return;
    setIsSubmitting(true);
    try {
      const items = dirtyRows.map((row) => ({
        productId: row.productId,
        newStockQuantity: row.newStockQuantity,
        reason: row.reason || undefined,
      }));

      const response = await adminStockService.bulkUpdateStock(items);
      const results: BulkStockUpdateResult[] = response.data;

      const successCount = results.filter((r) => r.success).length;
      const failCount = results.length - successCount;

      if (failCount > 0) {
        const failedNames = results.filter((r) => !r.success).map((r) => r.productName || r.productId).join(', ');
        showToast('warning', `${successCount} ürün güncellendi, ${failCount} ürün güncellenemedi: ${failedNames}`);
      } else {
        showToast('success', `${successCount} ürünün stoğu güncellendi`);
      }

      setIsConfirmOpen(false);
      clearAllEdits();
      fetchProducts(currentPage);
    } catch (error: any) {
      console.error('Bulk stock update error:', error);
      showToast('error', error.response?.data?.message || 'Toplu stok güncelleme sırasında bir hata oluştu.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-8 animate-fade-in">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-extrabold text-black tracking-tight">Toplu Stok Yönetimi</h1>
          <p className="text-slate-400 text-sm mt-1">Ürün stoklarını toplu olarak güncelleyin ve değişiklikleri stok hareketleri olarak kaydedin.</p>
        </div>
        <div className="flex items-center space-x-2">
          {dirtyRows.length > 0 && (
            <button
              onClick={clearAllEdits}
              className="text-slate-400 hover:text-white text-xs font-semibold px-3 py-2 border border-slate-800 rounded-lg hover:bg-slate-800 transition-colors cursor-pointer"
            >
              Değişiklikleri Temizle
            </button>
          )}
          <button
            onClick={() => setIsConfirmOpen(true)}
            disabled={dirtyRows.length === 0 || isSubmitting}
            className="bg-indigo-650 hover:bg-indigo-600 text-black font-bold py-2.5 px-5 rounded-lg text-sm flex items-center space-x-1.5 transition-colors shadow-md shadow-indigo-500/10 disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer"
          >
            <Boxes className="w-4 h-4 stroke-[3]" />
            <span>Toplu Güncelle ({dirtyRows.length})</span>
          </button>
        </div>
      </div>

      {/* Filter and Search Panel */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 flex flex-col lg:flex-row gap-4 items-stretch lg:items-center justify-between">
        <form onSubmit={handleSearchSubmit} className="relative flex-1 max-w-md">
          <input
            type="text"
            placeholder="Ürün adı veya açıklama ara..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-slate-950 text-white border border-slate-800 rounded-lg py-2 pl-4 pr-10 text-sm focus:outline-none focus:border-indigo-600 transition-colors"
          />
          <button type="submit" className="absolute right-3 top-2.5 text-slate-500 hover:text-white cursor-pointer">
            <Search className="w-4 h-4" />
          </button>
        </form>

        <div className="flex flex-wrap items-center gap-3">
          {/* Stock filter quick buttons */}
          <div className="flex items-center bg-slate-950 border border-slate-800 rounded-lg p-1">
            {(
              [
                { key: 'all', label: 'Tümü' },
                { key: 'out', label: 'Stok Sıfır' },
                { key: 'in', label: 'Stok Girdisi Olanlar' },
              ] as { key: StockFilter; label: string }[]
            ).map((f) => (
              <button
                key={f.key}
                onClick={() => setStockFilter(f.key)}
                className={`px-3 py-1.5 rounded-md text-xs font-semibold transition-colors cursor-pointer ${
                  stockFilter === f.key
                    ? 'bg-indigo-600 text-black'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                {f.label}
              </button>
            ))}
          </div>

          <select
            value={selectedCategoryId}
            onChange={(e) => setSelectedCategoryId(e.target.value)}
            className="bg-slate-950 border border-slate-800 text-slate-300 rounded-lg py-2 px-3.5 text-sm focus:outline-none focus:border-indigo-600 transition-colors"
          >
            <option value="">Tüm Kategoriler</option>
            {categories.map((c) => (
              <option key={c.id} value={c.id}>
                {c.name}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Product List Table */}
      {isLoading ? (
        <div className="flex flex-col items-center justify-center py-20 bg-slate-900/30 rounded-2xl border border-slate-800">
          <RefreshCw className="w-10 h-10 text-indigo-600 animate-spin" />
          <p className="text-slate-400 text-sm font-semibold mt-4">Ürünler Yükleniyor...</p>
        </div>
      ) : filteredProducts.length === 0 ? (
        <div className="bg-slate-900/30 border border-slate-800 rounded-2xl p-16 text-center">
          <Boxes className="w-12 h-12 text-slate-600 mx-auto mb-4" />
          <p className="text-slate-400 text-sm font-medium">Aradığınız kriterlere uygun ürün bulunamadı.</p>
        </div>
      ) : (
        <div className="space-y-6">
          <div className="bg-slate-900 border border-slate-800 rounded-xl overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-slate-850 text-slate-400 text-xs uppercase font-bold border-b border-slate-800">
                    <th className="py-4 px-6">Ürün</th>
                    <th className="py-4 px-6">Kategori</th>
                    <th className="py-4 px-6 text-center">Mevcut Stok</th>
                    <th className="py-4 px-6 text-center">Yeni Stok</th>
                    <th className="py-4 px-6">Gerekçe (Opsiyonel)</th>
                    <th className="py-4 px-6 text-center">İşlem</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800 text-sm">
                  {filteredProducts.map((product) => {
                    const editRow = editRows[product.id];
                    const isDirty = editRow?.isDirty ?? false;
                    return (
                      <tr key={product.id} className="border border-slate-800 hover:bg-slate-850/50 transition-colors">
                        <td className="py-4 px-6">
                          <p className="font-semibold text-black">{product.name}</p>
                          <p className="text-slate-500 text-xs mt-0.5 line-clamp-1 max-w-sm">{product.description}</p>
                        </td>
                        <td className="py-4 px-6 text-slate-300 font-medium">
                          {getCategoryName(product.categoryId)}
                        </td>
                        <td className="py-4 px-6 text-center">
                          <div className="flex flex-col items-center gap-1">
                            <span className="font-bold text-black">{product.stockQuantity}</span>
                            {getStockBadge(product.stockQuantity)}
                          </div>
                        </td>
                        <td className="py-4 px-6">
                          <input
                            type="number"
                            min={0}
                            step={1}
                            value={editRow?.newStockQuantity ?? product.stockQuantity}
                            onChange={(e) => updateEditRow(product.id, 'newStockQuantity', parseInt(e.target.value || '0', 10))}
                            className={`w-24 bg-slate-950 border ${
                              isDirty ? 'border-indigo-600' : 'border-slate-800'
                            } text-black rounded-lg py-2 px-3 text-sm text-center focus:outline-none focus:border-indigo-600 transition-colors`}
                          />
                        </td>
                        <td className="py-4 px-6">
                          <input
                            type="text"
                            placeholder="Örn. Sayım farkı"
                            value={editRow?.reason ?? ''}
                            onChange={(e) => updateEditRow(product.id, 'reason', e.target.value)}
                            className="w-full bg-slate-950 border border-slate-800 text-black rounded-lg py-2 px-3 text-sm placeholder-slate-500 focus:outline-none focus:border-indigo-600 transition-colors"
                          />
                        </td>
                        <td className="py-4 px-6 text-center">
                          {isDirty ? (
                            <button
                              onClick={() => resetRow(product.id)}
                              className="p-1.5 bg-slate-800 hover:bg-slate-700 border border-slate-700 text-slate-300 rounded-lg transition-colors cursor-pointer"
                              title="Değişikliği geri al"
                            >
                              <X className="w-4 h-4" />
                            </button>
                          ) : (
                            <span className="text-slate-600 text-xs">-</span>
                          )}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>

          <Pagination currentPage={currentPage} totalPages={totalPages} onPageChange={handlePageChange} />
        </div>
      )}

      {/* Confirm Update Modal */}
      {isConfirmOpen && (
        <div className="fixed inset-0 z-50 overflow-hidden flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/60 backdrop-blur-xs" onClick={() => setIsConfirmOpen(false)} />
          <div className="bg-slate-900 border border-slate-800 rounded-2xl max-w-md w-full p-6 text-center space-y-6 shadow-2xl relative z-10">
            <div className="flex justify-center">
              <div className="bg-indigo-500/10 border border-indigo-500/35 p-3 rounded-full text-indigo-600">
                <Boxes className="w-12 h-12" />
              </div>
            </div>
            <div className="space-y-2">
              <h3 className="text-lg font-bold text-black">Toplu Stok Güncelleme</h3>
              <p className="text-slate-400 text-xs leading-relaxed">
                <span className="font-bold text-indigo-600">{dirtyRows.length}</span> ürünün stoğu güncellenecek.
                Bu işlem stok hareketleri geçmişine <span className="font-semibold text-black">ADJUSTMENT</span> kaydı olarak eklenecektir.
              </p>
            </div>
            <div className="bg-slate-950 border border-slate-800 rounded-lg p-3 max-h-40 overflow-y-auto space-y-1.5 text-left">
              {dirtyRows.map((row) => {
                const product = products.find((p) => p.id === row.productId);
                return (
                  <div key={row.productId} className="flex justify-between items-center text-xs">
                    <span className="text-slate-300 font-medium truncate flex-1">{product?.name || row.productId}</span>
                    <span className="text-slate-500 ml-2">
                      {product?.stockQuantity ?? 0} → <span className="font-bold text-indigo-600">{row.newStockQuantity}</span>
                    </span>
                  </div>
                );
              })}
            </div>
            <div className="flex space-x-3 pt-2">
              <button
                onClick={() => setIsConfirmOpen(false)}
                disabled={isSubmitting}
                className="flex-1 bg-white hover:bg-indigo-50 border border-indigo-600 text-indigo-600 font-semibold py-2.5 px-4 rounded-lg transition-all active:scale-[0.98] cursor-pointer text-sm"
              >
                Vazgeç
              </button>
              <button
                onClick={handleBulkUpdate}
                disabled={isSubmitting}
                className="flex-1 bg-indigo-650 hover:bg-indigo-600 disabled:bg-indigo-800 text-black font-semibold py-2.5 px-4 rounded-lg transition-all active:scale-[0.98] flex items-center justify-center cursor-pointer text-sm"
              >
                {isSubmitting ? (
                  <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                ) : (
                  <span>Onayla ve Güncelle</span>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};