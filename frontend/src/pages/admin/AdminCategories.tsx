import React, { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { adminCategoryService } from '../../api/adminCategoryService';
import { categoryService } from '../../api/categoryService';
import { useToast } from '../../context/ToastContext';
import type { Category } from '../../types';
import { Plus, Edit2, Trash2, FolderOpen, AlertCircle, RefreshCw, X } from 'lucide-react';

const categoryFormSchema = z.object({
  name: z.string().min(2, 'Kategori adı en az 2 karakter olmalıdır'),
  description: z.string().optional(),
});

type CategoryFormData = z.infer<typeof categoryFormSchema>;

export const AdminCategories: React.FC = () => {
  const { showToast } = useToast();
  const [categories, setCategories] = useState<Category[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Modals state
  const [isFormModalOpen, setIsFormModalOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState<Category | null>(null);
  const [deletingCategoryId, setDeletingCategoryId] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const fetchCategories = async () => {
    setIsLoading(true);
    try {
      const response = await categoryService.getAllCategories();
      setCategories(response.data);
    } catch (error) {
      console.error('Error fetching admin categories:', error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchCategories();
  }, []);

  // Form modal management
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<CategoryFormData>({
    resolver: zodResolver(categoryFormSchema),
  });

  const handleOpenAddModal = () => {
    setEditingCategory(null);
    reset({
      name: '',
      description: '',
    });
    setErrorMessage(null);
    setIsFormModalOpen(true);
  };

  const handleOpenEditModal = (category: Category) => {
    setEditingCategory(category);
    reset({
      name: category.name,
      description: category.description || '',
    });
    setErrorMessage(null);
    setIsFormModalOpen(true);
  };

  const onFormSubmit = async (data: CategoryFormData) => {
    setIsSubmitting(true);
    setErrorMessage(null);
    try {
      if (editingCategory) {
        await adminCategoryService.updateCategory(editingCategory.id, data);
        showToast('success', 'Kategori başarıyla güncellendi');
      } else {
        await adminCategoryService.createCategory(data);
        showToast('success', 'Kategori başarıyla oluşturuldu');
      }
      setIsFormModalOpen(false);
      fetchCategories();
    } catch (error: any) {
      console.error('Error saving category:', error);
      setErrorMessage(error.response?.data?.message || 'Kategori kaydedilirken hata oluştu.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteConfirm = async () => {
    if (!deletingCategoryId) return;
    setIsSubmitting(true);
    try {
      await adminCategoryService.deleteCategory(deletingCategoryId);
      setDeletingCategoryId(null);
      showToast('warning', 'Kategori silindi');
      fetchCategories();
    } catch (error) {
      console.error('Error deleting category:', error);
      showToast('error', 'Kategori silinirken hata oluştu. Kategoriye bağlı ürünler olabilir.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-8 animate-fade-in">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-extrabold text-black tracking-tight">Kategori Yönetimi</h1>
          <p className="text-slate-400 text-sm mt-1">Ürün gruplarını sınıflandırın ve koleksiyonları düzenleyin.</p>
        </div>
        <button
          onClick={handleOpenAddModal}
          className="bg-indigo-650 hover:bg-indigo-600 text-black font-bold py-2.5 px-5 rounded-lg text-sm flex items-center space-x-1.5 transition-colors shadow-md shadow-indigo-500/10 cursor-pointer"
        >
          <Plus className="w-4 h-4 text-slate-955 stroke-[3]" />
          <span>Yeni Kategori Ekle</span>
        </button>
      </div>

      {/* Category List */}
      {isLoading ? (
        <div className="flex flex-col items-center justify-center py-20 bg-slate-900/30 rounded-2xl border border-slate-855">
          <RefreshCw className="w-10 h-10 text-indigo-600 animate-spin" />
          <p className="text-slate-400 text-sm font-semibold mt-4">Kategoriler Yükleniyor...</p>
        </div>
      ) : categories.length === 0 ? (
        <div className="bg-slate-900/30 border border-slate-800 rounded-2xl p-16 text-center">
          <FolderOpen className="w-12 h-12 text-slate-600 mx-auto mb-4" />
          <p className="text-slate-400 text-sm font-medium">Henüz bir kategori eklenmemiş.</p>
        </div>
      ) : (
        <div className="bg-slate-900 border border-slate-800 rounded-xl overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-850 text-slate-400 text-xs uppercase font-bold border-b border-slate-800">
                  <th className="py-4 px-6">Kategori</th>
                  <th className="py-4 px-6">Açıklama</th>
                  <th className="py-4 px-6 text-center w-32">İşlemler</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800 text-sm">
                {categories.map((category) => (
                  <tr key={category.id} className="border border-slate-800 hover:bg-slate-850/50 transition-colors">
                    <td className="py-4 px-6 font-semibold text-black">
                      {category.name}
                    </td>
                    <td className="py-4 px-6 text-slate-300">
                      {category.description || 'Açıklama girilmemiş'}
                    </td>
                    <td className="py-4 px-6">
                      <div className="flex items-center justify-center space-x-2.5">
                        <button
                          onClick={() => handleOpenEditModal(category)}
                          className="p-1.5 bg-slate-800 hover:bg-slate-700 border border-slate-750 text-indigo-600 hover:text-indigo-500 rounded-lg transition-colors cursor-pointer"
                          title="Düzenle"
                        >
                          <Edit2 className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => setDeletingCategoryId(category.id)}
                          className="p-1.5 bg-slate-800 hover:bg-slate-700 border border-slate-750 text-red-500 hover:text-red-450 rounded-lg transition-colors cursor-pointer"
                          title="Sil"
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
      )}

      {/* Add / Edit Form Modal */}
      {isFormModalOpen && (
        <div className="fixed inset-0 z-50 overflow-y-auto flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/60 backdrop-blur-xs" onClick={() => setIsFormModalOpen(false)} />
          <div className="bg-slate-900 border border-slate-800 rounded-2xl max-w-md w-full p-6 shadow-2xl relative z-10 space-y-6 animate-fade-in">
            <div className="flex justify-between items-center pb-2">
              <h3 className="text-xl font-bold text-black">
                {editingCategory ? 'Kategoriyi Düzenle' : 'Yeni Kategori Ekle'}
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
                  Kategori Adı
                </label>
                <input
                  id="name"
                  type="text"
                  placeholder="Koleksiyon, Elektronik vb."
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
                  placeholder="Kategoriye ait genel detaylar"
                  rows={4}
                  {...register('description')}
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg py-2 px-3.5 text-black placeholder-slate-400 focus:outline-none focus:border-indigo-600 transition-colors resize-none"
                />
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
                    <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  ) : (
                    <span>Kaydet</span>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {deletingCategoryId && (
        <div className="fixed inset-0 z-50 overflow-hidden flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/60 backdrop-blur-xs" onClick={() => setDeletingCategoryId(null)} />
          <div className="bg-slate-900 border border-slate-800 rounded-2xl max-w-md w-full p-6 text-center space-y-6 shadow-2xl relative z-10 animate-fade-in">
            <div className="flex justify-center">
              <div className="bg-red-500/10 border border-red-500/35 p-3 rounded-full text-red-400">
                <AlertCircle className="w-12 h-12" />
              </div>
            </div>
            <div className="space-y-2">
              <h3 className="text-lg font-bold text-black">Kategoriyi Sil</h3>
              <p className="text-slate-400 text-xs leading-relaxed">
                Bu kategoriyi silmek istediğinize emin misiniz? Bu işlem geri alınamaz ve kategoriye bağlı ürün varsa hata verebilir.
              </p>
            </div>
            <div className="flex space-x-3 pt-2">
              <button
                onClick={() => setDeletingCategoryId(null)}
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
    </div>
  );
};
