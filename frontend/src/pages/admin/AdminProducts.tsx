import React, { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { adminProductService } from '../../api/adminProductService';
import { adminStockService } from '../../api/adminStockService';
import { productService } from '../../api/productService';
import { categoryService } from '../../api/categoryService';
import { useToast } from '../../context/ToastContext';
import type { Product, Category } from '../../types';
import { Pagination } from '../../components/common/Pagination';
import { Plus, Edit2, Trash2, Search, AlertCircle, RefreshCw, X, ShoppingBag, PackagePlus, MinusCircle, Settings2 } from 'lucide-react';

const productFormSchema = z.object({
  name: z.string().min(3, 'Ürün adı en az 3 karakter olmalıdır'),
  description: z.string().min(5, 'Açıklama en az 5 karakter olmalıdır'),
  price: z.number({ message: 'Geçerli bir sayı girin' }).min(0.01, 'Fiyat en az 0.01 TL olmalıdır'),
  stockQuantity: z.number({ message: 'Geçerli bir tam sayı girin' }).min(0, 'Stok miktarı en az 0 olmalıdır'),
  categoryId: z.string().min(1, 'Bir kategori seçmelisiniz'),
  active: z.boolean(),
});

type ProductFormData = z.infer<typeof productFormSchema>;

type StockOperationType = 'add' | 'deduct' | 'adjust';

interface StockOperationState {
  product: Product;
  operationType: StockOperationType;
  quantity: number;
  reason: string;
}

export const AdminProducts: React.FC = () => {
  const { showToast } = useToast();
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [currentPage, setCurrentPage] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [isLoading, setIsLoading] = useState(true);

  // Filters
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategoryId, setSelectedCategoryId] = useState('');
  const [filterTrigger, setFilterTrigger] = useState(0);

  // Modals state
  const [isFormModalOpen, setIsFormModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [deletingProductId, setDeletingProductId] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Stock operation modal state
  const [stockOperation, setStockOperation] = useState<StockOperationState | null>(null);
  const [isStockSubmitting, setIsStockSubmitting] = useState(false);

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
      console.error('Error fetching admin products:', error);
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
  }, [filterTrigger, selectedCategoryId]);

  const handlePageChange = (page: number) => {
    fetchProducts(page);
  };

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setFilterTrigger((prev) => prev + 1);
  };

  // Form modal management
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<ProductFormData>({
    resolver: zodResolver(productFormSchema),
  });

  const handleOpenAddModal = () => {
    setEditingProduct(null);
    reset({
      name: '',
      description: '',
      price: 0,
      stockQuantity: 0,
      categoryId: categories[0]?.id || '',
      active: true,
    });
    setErrorMessage(null);
    setIsFormModalOpen(true);
  };

  const handleOpenEditModal = (product: Product) => {
    setEditingProduct(product);
    reset({
      name: product.name,
      description: product.description,
      price: product.price,
      stockQuantity: product.stockQuantity,
      categoryId: product.categoryId,
      active: product.active,
    });
    setErrorMessage(null);
    setIsFormModalOpen(true);
  };

  const onFormSubmit = async (data: ProductFormData) => {
    setIsSubmitting(true);
    setErrorMessage(null);
    try {
      if (editingProduct) {
        await adminProductService.updateProduct(editingProduct.id, data);
        showToast('success', 'Ürün başarıyla güncellendi');
      } else {
        await adminProductService.createProduct(data);
        showToast('success', 'Ürün başarıyla oluşturuldu');
      }
      setIsFormModalOpen(false);
      fetchProducts(currentPage);
    } catch (error: any) {
      console.error('Error saving product:', error);
      setErrorMessage(error.response?.data?.message || 'Ürün kaydedilirken hata oluştu.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteConfirm = async () => {
    if (!deletingProductId) return;
    setIsSubmitting(true);
    try {
      await adminProductService.deleteProduct(deletingProductId);
      setDeletingProductId(null);
      showToast('warning', 'Ürün kaldırıldı');
      fetchProducts(currentPage);
    } catch (error) {
      console.error('Error deactivating product:', error);
      showToast('error', 'Ürün kaldırılırken hata oluştu.');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Stock operation handlers
  const openStockOperation = (product: Product, operationType: StockOperationType) => {
    setStockOperation({
      product,
      operationType,
      quantity: operationType === 'adjust' ? product.stockQuantity : 1,
      reason: '',
    });
  };

  const handleStockOperation = async () => {
    if (!stockOperation) return;
    const { product, operationType, quantity, reason } = stockOperation;
    setIsStockSubmitting(true);
    try {
      if (operationType === 'add') {
        await adminStockService.addStock(product.id, quantity, reason || undefined);
        showToast('success', `${quantity} adet stok eklendi`);
      } else if (operationType === 'deduct') {
        await adminStockService.deductStock(product.id, quantity, reason || undefined);
        showToast('success', `${quantity} adet stok düşüldü`);
      } else {
        await adminStockService.adjustStock(product.id, quantity, reason || undefined);
        showToast('success', `Stok ${quantity} olarak düzeltildi`);
      }
      setStockOperation(null);
      fetchProducts(currentPage);
    } catch (error: any) {
      console.error('Stock operation error:', error);
      showToast('error', error.response?.data?.message || 'Stok işlemi sırasında bir hata oluştu.');
    } finally {
      setIsStockSubmitting(false);
    }
  };

  const getCategoryName = (catId: string) => {
    return categories.find((c) => c.id === catId)?.name || 'Kategorisiz';
  };

  const getStockBadge = (stock: number) => {
    if (stock <= 0) {
      return <span className="text-red-400">Tükendi</span>;
    } else if (stock < 5) {
      return <span className="text-amber-400">{stock} (Düşük)</span>;
    }
    return <span className="text-slate-300">{stock}</span>;
  };

  const operationLabels: Record<StockOperationType, string> = {
    add: 'Stok Ekle',
    deduct: 'Stok Çıkar',
    adjust: 'Stok Düzelt',
  };

  const operationDescriptions: Record<StockOperationType, string> = {
    add: 'Mevcut stoğa belirli bir miktar ekleyin. Stok hareketi RESTOCK olarak kaydedilir.',
    deduct: 'Mevcut stoktan belirli bir miktar düşün. Stok hareketi ADJUSTMENT olarak kaydedilir.',
    adjust: 'Stok miktarını doğrudan yeni bir değere ayarlayın. Stok hareketi ADJUSTMENT olarak kaydedilir.',
  };

  return (
    <div className="space-y-8 animate-fade-in">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-extrabold text-black tracking-tight">Ürün Yönetimi</h1>
          <p className="text-slate-400 text-sm mt-1">Mağazanızdaki ürünleri ekleyin, güncelleyin veya kaldırın.</p>
        </div>
        <button
          onClick={handleOpenAddModal}
          className="bg-indigo-650 hover:bg-indigo-600 text- font-bold py-2.5 px-5 rounded-lg text-sm flex items-center space-x-1.5 transition-colors shadow-md shadow-indigo-500/10 cursor-pointer"
        >
          <Plus className="w-4 h-4 text-slate-955 stroke-[3]" />
          <span>Yeni Ürün Ekle</span>
        </button>
      </div>

      {/* Filter and Search Panel */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 flex flex-col md:flex-row gap-4 items-stretch md:items-center justify-between">
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

        <div className="flex items-center space-x-3">
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
        <div className="flex flex-col items-center justify-center py-20 bg-slate-900/30 rounded-2xl border border-slate-855">
          <RefreshCw className="w-10 h-10 text-indigo-600 animate-spin" />
          <p className="text-slate-400 text-sm font-semibold mt-4">Ürünler Yükleniyor...</p>
        </div>
      ) : products.length === 0 ? (
        <div className="bg-slate-900/30 border border-slate-800 rounded-2xl p-16 text-center">
          <ShoppingBag className="w-12 h-12 text-slate-600 mx-auto mb-4" />
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
                    <th className="py-4 px-6 text-right">Fiyat</th>
                    <th className="py-4 px-6 text-center">Stok</th>
                    <th className="py-4 px-6 text-center">Durum</th>
                    <th className="py-4 px-6 text-center">İşlemler</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800 text-sm">
                  {products.map((product) => (
                    <tr key={product.id} className="border border-slate-800 hover:bg-slate-850/50 transition-colors">
                      <td className="py-4 px-6">
                        <p className="font-semibold text-black">{product.name}</p>
                        <p className="text-slate-500 text-xs mt-0.5 line-clamp-1 max-w-sm">{product.description}</p>
                      </td>
                      <td className="py-4 px-6 text-slate-300 font-medium">
                        {getCategoryName(product.categoryId)}
                      </td>
                      <td className="py-4 px-6 text-right font-bold text-black">
                        {product.price.toLocaleString('tr-TR')} TL
                      </td>
                      <td className="py-4 px-6 text-center font-semibold">
                        {getStockBadge(product.stockQuantity)}
                      </td>
                      <td className="py-4 px-6 text-center">
                        {product.active ? (
                          <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-semibold bg-emerald-500/10 border border-emerald-500/30 text-emerald-400">
                            Aktif
                          </span>
                        ) : (
                          <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-semibold bg-slate-800 border border-slate-700 text-slate-400">
                            Pasif
                          </span>
                        )}
                      </td>
                      <td className="py-4 px-6">
                        <div className="flex items-center justify-center space-x-2.5">
                          <button
                            onClick={() => openStockOperation(product, 'add')}
                            className="p-1.5 bg-slate-800 hover:bg-slate-700 border border-slate-750 text-emerald-500 hover:text-emerald-400 rounded-lg transition-colors cursor-pointer"
                            title="Stok Ekle"
                          >
                            <PackagePlus className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => openStockOperation(product, 'deduct')}
                            className="p-1.5 bg-slate-800 hover:bg-slate-700 border border-slate-750 text-red-500 hover:text-red-400 rounded-lg transition-colors cursor-pointer"
                            title="Stok Çıkar"
                          >
                            <MinusCircle className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => openStockOperation(product, 'adjust')}
                            className="p-1.5 bg-slate-800 hover:bg-slate-700 border border-slate-750 text-amber-500 hover:text-amber-400 rounded-lg transition-colors cursor-pointer"
                            title="Stok Düzelt"
                          >
                            <Settings2 className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => handleOpenEditModal(product)}
                            className="p-1.5 bg-slate-800 hover:bg-slate-700 border border-slate-750 text-indigo-600 hover:text-indigo-500 rounded-lg transition-colors cursor-pointer"
                            title="Düzenle"
                          >
                            <Edit2 className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => setDeletingProductId(product.id)}
                            disabled={!product.active}
                            className="p-1.5 bg-slate-800 hover:bg-slate-700 border border-slate-750 text-red-500 hover:text-red-450 disabled:opacity-40 disabled:cursor-not-allowed rounded-lg transition-colors cursor-pointer"
                            title="Kaldır"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
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

      {/* Add / Edit Form Modal */}
      {isFormModalOpen && (
        <div className="fixed inset-0 z-50 overflow-y-auto flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/60 backdrop-blur-xs" onClick={() => setIsFormModalOpen(false)} />
          <div className="bg-slate-900 border border-slate-800 rounded-2xl max-w-lg w-full p-6 shadow-2xl relative z-10 space-y-6">
            <div className="flex justify-between items-center pb-">
              <h3 className="text-xl font-bold text-black">
                {editingProduct ? 'Ürünü Düzenle' : 'Yeni Ürün Ekle'}
              </h3>
              <button
                onClick={() => setIsFormModalOpen(false)}
                className="text-slate-400 hover:text-white cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {errorMessage && (
              <div className="bg-red-500/10 border border-red-500/50 rounded-lg p-3.5 flex items-start space-x-2.5 text-red-200 text-xs">
                <AlertCircle className="w-4 h-4 text-red-400 shrink-0 mt-0.5" />
                <span>{errorMessage}</span>
              </div>
            )}

            <form onSubmit={handleSubmit(onFormSubmit)} className="space-y-4 text-sm">
              <div>
                <label className="block text-slate-350 font-semibold mb-1.5" htmlFor="name">
                  Ürün Adı
                </label>
                <input
                  id="name"
                  type="text"
                  placeholder="Ürün başlığı"
                  {...register('name')}
                  className={`w-full bg-slate-950 border ${
                    errors.name ? 'border-red-500' : 'border-slate-800'
                  } rounded-lg py-2 px-3.5 text-black placeholder-slate-400 focus:outline-none focus:border-indigo-600 transition-colors`}
                />
                {errors.name && (
                  <span className="text-red-400 text-xs mt-1 block">{errors.name.message}</span>
                )}
              </div>

              <div>
                <label className="block text-slate-350 font-semibold mb-1.5" htmlFor="description">
                  Açıklama
                </label>
                <textarea
                  id="description"
                  placeholder="Ürün hakkında detaylı bilgi"
                  rows={3}
                  {...register('description')}
                  className={`w-full bg-slate-950 border ${
                    errors.description ? 'border-red-500' : 'border-slate-800'
                  } rounded-lg py-2 px-3.5 text-black placeholder-slate-400 focus:outline-none focus:border-indigo-600 transition-colors resize-none`}
                />
                {errors.description && (
                  <span className="text-red-400 text-xs mt-1 block">{errors.description.message}</span>
                )}
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-slate-350 font-semibold mb-1.5" htmlFor="price">
                    Birim Fiyat (TL)
                  </label>
                  <input
                    id="price"
                    type="number"
                    step="1"
                    placeholder="250.00"
                    {...register('price', { valueAsNumber: true })}
                    className={`w-full bg-slate-950 border ${
                      errors.price ? 'border-red-500' : 'border-slate-800'
                    } rounded-lg py-2 px-3.5 text-black placeholder-slate-400 focus:outline-none focus:border-indigo-600 transition-colors`}
                  />
                  {errors.price && (
                    <span className="text-red-400 text-xs mt-1 block">{errors.price.message}</span>
                  )}
                </div>

                <div>
                  <label className="block text-slate-350 font-semibold mb-1.5" htmlFor="stockQuantity">
                    Stok Miktarı
                  </label>
                  <input
                    id="stockQuantity"
                    type="number"
                    placeholder="50"
                    step="1"
                    {...register('stockQuantity', { valueAsNumber: true })}
                    className={`w-full bg-slate-950 border ${
                      errors.stockQuantity ? 'border-red-500' : 'border-slate-800'
                    } rounded-lg py-2 px-3.5 text-black placeholder-slate-400 focus:outline-none focus:border-indigo-600 transition-colors`}
                  />
                  {errors.stockQuantity && (
                    <span className="text-red-400 text-xs mt-1 block">{errors.stockQuantity.message}</span>
                  )}
                </div>
              </div>

              <div>
                <label className="block text-slate-355 font-semibold mb-1.5" htmlFor="categoryId">
                  Kategori
                </label>
                <select
                  id="categoryId"
                  {...register('categoryId')}
                  className="w-full bg-slate-955 border border-slate-800 text-black rounded-lg py-2 px-3.5 focus:outline-none focus:border-indigo-600 transition-colors"
                >
                  {categories.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.name}
                    </option>
                  ))}
                </select>
              </div>

              <div className="flex items-center space-x-2 pt-2 select-none">
                <input
                  id="active"
                  type="checkbox"
                  {...register('active')}
                  className="w-4 h-4 bg-slate-950 border border-slate-800 text-indigo-600 focus:ring-0 rounded-md cursor-pointer"
                />
                <label htmlFor="active" className="text-slate-300 font-semibold cursor-pointer">
                  Satışta (Aktif Ürün)
                </label>
              </div>

              <div className="flex space-x-3 pt-4">
                <button
                  type="button"
                  onClick={() => setIsFormModalOpen(false)}
                  className="flex-1 bg-red-650 hover:bg-red-50 disabled:bg-red-800 text-red-600 font-semibold py-2.5 px-4 border border-red-700 rounded-lg transition-all active:scale-[0.98] flex items-center justify-center cursor-pointer text-sm"
                >
                  Vazgeç
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="flex-1 bg-white hover:bg-indigo-50 border border-indigo-600 text-indigo-600 font-semibold py-2.5 px-4 rounded-lg transition-all active:scale-[0.98] cursor-pointer text-sm"
                >
                  {isSubmitting ? (
                    <div className="w-5 h-5 border-2 border-slate-950 border-t-transparent rounded-full animate-spin"></div>
                  ) : (
                    <span>Kaydet</span>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete / Deactivate Confirmation Modal */}
      {deletingProductId && (
        <div className="fixed inset-0 z-50 overflow-hidden flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/60 backdrop-blur-xs" onClick={() => setDeletingProductId(null)} />
          <div className="bg-slate-900 border border-slate-800 rounded-2xl max-w-md w-full p-6 text-center space-y-6 shadow-2xl relative z-10">
            <div className="flex justify-center">
              <div className="bg-red-500/10 border border-red-500/35 p-3 rounded-full text-red-400">
                <AlertCircle className="w-12 h-12" />
              </div>
            </div>
            <div className="space-y-2">
              <h3 className="text-lg font-bold text-black">Ürünü Kaldır</h3>
              <p className="text-slate-405 text-xs leading-relaxed">
                Bu ürünü kaldırmak istediğinize emin misiniz? Ürün katalog listelerinde artık gösterilmeyecektir.
              </p>
            </div>
            <div className="flex space-x-3 pt-2">
              <button
                onClick={() => setDeletingProductId(null)}
                className="flex-1 bg-white hover:bg-indigo-50 border border-indigo-600 text-indigo-600 font-semibold py-2.5 px-4 rounded-lg transition-all active:scale-[0.98] cursor-pointer text-sm"
              >
                Vazgeç
              </button>
              <button
                onClick={handleDeleteConfirm}
                disabled={isSubmitting}
                className="flex-1 bg-red-650 hover:bg-red-50 disabled:bg-red-800 text-red-600 font-semibold py-2.5 px-4 border border-red-700 rounded-lg transition-all active:scale-[0.98] flex items-center justify-center cursor-pointer text-sm"
              >
                {isSubmitting ? (
                  <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                ) : (
                  <span>Kaldır</span>
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Stock Operation Modal */}
      {stockOperation && (
        <div className="fixed inset-0 z-50 overflow-hidden flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/60 backdrop-blur-xs" onClick={() => setStockOperation(null)} />
          <div className="bg-slate-900 border border-slate-800 rounded-2xl max-w-md w-full p-6 shadow-2xl relative z-10 space-y-6">
            <div className="flex justify-between items-center">
              <h3 className="text-xl font-bold text-black">Stok İşlemi</h3>
              <button
                onClick={() => setStockOperation(null)}
                className="text-slate-400 hover:text-white cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Product info */}
            <div className="bg-slate-950 border border-slate-800 rounded-lg p-4 space-y-1.5">
              <p className="font-semibold text-black text-sm">{stockOperation.product.name}</p>
              <p className="text-slate-500 text-xs">
                Mevcut Stok: <span className="font-bold text-black">{stockOperation.product.stockQuantity}</span>
              </p>
            </div>

            {/* Operation type selector */}
            <div className="grid grid-cols-3 gap-2">
              {(['add', 'deduct', 'adjust'] as StockOperationType[]).map((type) => (
                <button
                  key={type}
                  onClick={() => setStockOperation((prev) => prev ? { ...prev, operationType: type, quantity: type === 'adjust' ? prev.product.stockQuantity : 1 } : prev)}
                  className={`py-2.5 px-3 rounded-lg text-xs font-bold transition-all cursor-pointer border ${
                    stockOperation.operationType === type
                      ? type === 'add'
                        ? 'bg-emerald-500/10 border-emerald-500/40 text-emerald-400'
                        : type === 'deduct'
                        ? 'bg-red-500/10 border-red-500/40 text-red-400'
                        : 'bg-amber-500/10 border-amber-500/40 text-amber-400'
                      : 'bg-slate-950 border-slate-800 text-slate-400 hover:text-white'
                  }`}
                >
                  {operationLabels[type]}
                </button>
              ))}
            </div>

            <p className="text-slate-500 text-xs leading-relaxed -mt-2">
              {operationDescriptions[stockOperation.operationType]}
            </p>

            {/* Quantity input */}
            <div>
              <label className="block text-slate-350 font-semibold mb-1.5">
                {stockOperation.operationType === 'adjust' ? 'Yeni Stok Miktarı' : 'Miktar'}
              </label>
              <input
                type="number"
                min={0}
                step={1}
                value={stockOperation.quantity}
                onChange={(e) =>
                  setStockOperation((prev) =>
                    prev ? { ...prev, quantity: parseInt(e.target.value || '0', 10) } : prev
                  )
                }
                className="w-full bg-slate-950 border border-slate-800 text-black rounded-lg py-2 px-3.5 text-sm focus:outline-none focus:border-indigo-600 transition-colors"
              />
              {stockOperation.operationType === 'deduct' && stockOperation.quantity > stockOperation.product.stockQuantity && (
                <p className="text-red-400 text-xs mt-1 flex items-center space-x-1">
                  <AlertCircle className="w-3 h-3" />
                  <span>Mevcut stoktan ({stockOperation.product.stockQuantity}) fazla düşemezsiniz.</span>
                </p>
              )}
            </div>

            {/* Reason input */}
            <div>
              <label className="block text-slate-350 font-semibold mb-1.5">
                Gerekçe <span className="text-slate-600 font-normal">(Opsiyonel)</span>
              </label>
              <input
                type="text"
                placeholder="Örn. Tedarikçi teslimatı, sayım farkı..."
                value={stockOperation.reason}
                onChange={(e) =>
                  setStockOperation((prev) => (prev ? { ...prev, reason: e.target.value } : prev))
                }
                className="w-full bg-slate-950 border border-slate-800 text-black rounded-lg py-2 px-3.5 text-sm placeholder-slate-500 focus:outline-none focus:border-indigo-600 transition-colors"
              />
            </div>

            {/* Preview */}
            <div className="bg-slate-950 border border-slate-800 rounded-lg p-3 flex justify-between items-center text-sm">
              <span className="text-slate-400">Sonuç Stok</span>
              <span className="font-bold text-black">
                {stockOperation.operationType === 'add'
                  ? stockOperation.product.stockQuantity + stockOperation.quantity
                  : stockOperation.operationType === 'deduct'
                  ? Math.max(0, stockOperation.product.stockQuantity - stockOperation.quantity)
                  : stockOperation.quantity}
              </span>
            </div>

            <div className="flex space-x-3 pt-2">
              <button
                onClick={() => setStockOperation(null)}
                disabled={isStockSubmitting}
                className="flex-1 bg-white hover:bg-indigo-50 border border-indigo-600 text-indigo-600 font-semibold py-2.5 px-4 rounded-lg transition-all active:scale-[0.98] cursor-pointer text-sm"
              >
                Vazgeç
              </button>
              <button
                onClick={handleStockOperation}
                disabled={
                  isStockSubmitting ||
                  stockOperation.quantity <= 0 ||
                  (stockOperation.operationType === 'deduct' && stockOperation.quantity > stockOperation.product.stockQuantity)
                }
                className={`flex-1 font-semibold py-2.5 px-4 rounded-lg transition-all active:scale-[0.98] flex items-center justify-center cursor-pointer text-sm disabled:opacity-40 disabled:cursor-not-allowed ${
                  stockOperation.operationType === 'add'
                    ? 'bg-emerald-600 hover:bg-emerald-500 text-black'
                    : stockOperation.operationType === 'deduct'
                    ? 'bg-red-600 hover:bg-red-500 text-black'
                    : 'bg-amber-600 hover:bg-amber-500 text-black'
                }`}
              >
                {isStockSubmitting ? (
                  <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                ) : (
                  <span>{operationLabels[stockOperation.operationType]}</span>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};