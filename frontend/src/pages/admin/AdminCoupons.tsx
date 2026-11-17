import React, { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import type { Resolver } from 'react-hook-form';
import { z } from 'zod';
import { adminCouponService } from '../../api/adminCouponService';
import { useToast } from '../../context/ToastContext';
import type { Coupon, CouponType } from '../../types';
import { Plus, Edit2, Trash2, AlertCircle, RefreshCw, X, Tag } from 'lucide-react';

// RHF `valueAsNumber: true` ile boş bırakılan sayısal alanlar `NaN` üretir.
// Bu yardımcı `NaN`/boş değeri `undefined`'a çevirerek isteğe bağlı alanların
// form doğrulamasını sessizce kilitlemesini (submit'in hiç çalışmamasını) engeller.
// Not: `z.preprocess` yerine union + transform kullanılır çünkü Zod v4'te
// preprocess çıktı tipini `unknown` olarak tahmin eder ve resolver tipi bozulur.
const toOptionalNumber = (schema: z.ZodNumber) =>
  z
    .union([schema, z.nan(), z.null(), z.undefined()])
    .transform((val) => {
      if (val === null || val === undefined || (typeof val === 'number' && Number.isNaN(val))) {
        return undefined;
      }
      return val;
    });

const couponFormSchema = z.object({
  code: z.string().min(2, 'Kupon kodu en az 2 karakter olmalıdır').max(50),
  description: z.string().optional(),
  type: z.enum(['PERCENTAGE', 'FIXED_AMOUNT']),
  discountValue: z.number({ message: 'Geçerli bir sayı girin' }).min(0.01, 'İndirim değeri en az 0.01 olmalıdır'),
  minimumOrderAmount: toOptionalNumber(z.number({ message: 'Geçerli bir sayı girin' }).min(0)),
  maximumDiscountAmount: toOptionalNumber(z.number({ message: 'Geçerli bir sayı girin' }).min(0)),
  usageLimit: toOptionalNumber(z.number({ message: 'Geçerli bir tam sayı girin' }).int().min(1)),
  validFrom: z.string().min(1, 'Başlangıç tarihi zorunludur'),
  validUntil: z.string().min(1, 'Bitiş tarihi zorunludur'),
  active: z.boolean(),
});

type CouponFormData = z.infer<typeof couponFormSchema>;

// Local datetime value for date input
const toLocalDateTimeInput = (date: Date | string) => {
  const d = date instanceof Date ? date : new Date(date);
  const pad = (n: number) => String(n).padStart(2, '0');
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
};

const nowLocalDateTimeInput = () => toLocalDateTimeInput(new Date());

// Yeni kupon için varsayılan bitiş tarihi: bugünden +30 gün.
// (Önceden validUntil == validFrom olduğundan kupon anında kullanılamıyordu.)
const nowPlusDaysLocalDateTimeInput = (days: number) => {
  const d = new Date();
  d.setDate(d.getDate() + days);
  return toLocalDateTimeInput(d);
};

export const AdminCoupons: React.FC = () => {
  const { showToast } = useToast();
  const [coupons, setCoupons] = useState<Coupon[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Modals state
  const [isFormModalOpen, setIsFormModalOpen] = useState(false);
  const [editingCoupon, setEditingCoupon] = useState<Coupon | null>(null);
  const [deletingCouponId, setDeletingCouponId] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const fetchCoupons = async () => {
    setIsLoading(true);
    try {
      const response = await adminCouponService.getAllCoupons();
      setCoupons(response.data);
    } catch (error) {
      console.error('Error fetching coupons:', error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchCoupons();
  }, []);

  const {
    register,
    handleSubmit,
    reset,
    watch,
    formState: { errors },
  } = useForm<CouponFormData, any, CouponFormData>({
    resolver: zodResolver(couponFormSchema) as Resolver<CouponFormData, any, CouponFormData>,
  });

  const couponType = watch('type');

  const handleOpenAddModal = () => {
    setEditingCoupon(null);
    reset({
      code: '',
      description: '',
      type: 'PERCENTAGE',
      discountValue: 10,
      minimumOrderAmount: undefined,
      maximumDiscountAmount: undefined,
      usageLimit: undefined,
      validFrom: nowLocalDateTimeInput(),
      validUntil: nowPlusDaysLocalDateTimeInput(30),
      active: true,
    });
    setErrorMessage(null);
    setIsFormModalOpen(true);
  };

  const handleOpenEditModal = (coupon: Coupon) => {
    setEditingCoupon(coupon);
    reset({
      code: coupon.code,
      description: coupon.description || '',
      type: coupon.type,
      discountValue: coupon.discountValue,
      minimumOrderAmount: coupon.minimumOrderAmount,
      maximumDiscountAmount: coupon.maximumDiscountAmount,
      usageLimit: coupon.usageLimit,
      validFrom: toLocalDateTimeInput(coupon.validFrom),
      validUntil: toLocalDateTimeInput(coupon.validUntil),
      active: coupon.active,
    });
    setErrorMessage(null);
    setIsFormModalOpen(true);
  };

  const onFormSubmit = async (data: CouponFormData) => {
    setIsSubmitting(true);
    setErrorMessage(null);
    try {
      const payload = {
        code: data.code,
        description: data.description,
        type: data.type,
        discountValue: data.discountValue,
        minimumOrderAmount: data.minimumOrderAmount ?? undefined,
        maximumDiscountAmount: data.maximumDiscountAmount ?? undefined,
        usageLimit: data.usageLimit ?? undefined,
        validFrom: data.validFrom,
        validUntil: data.validUntil,
      };

      if (editingCoupon) {
        await adminCouponService.updateCoupon(editingCoupon.id, { ...payload, active: data.active });
        showToast('success', 'Kupon başarıyla güncellendi');
      } else {
        await adminCouponService.createCoupon(payload);
        showToast('success', 'Kupon başarıyla oluşturuldu');
      }
      setIsFormModalOpen(false);
      fetchCoupons();
    } catch (error: any) {
      console.error('Error saving coupon:', error);
      setErrorMessage(error.response?.data?.message || 'Kupon kaydedilirken hata oluştu.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteConfirm = async () => {
    if (!deletingCouponId) return;
    setIsSubmitting(true);
    try {
      await adminCouponService.deleteCoupon(deletingCouponId);
      setDeletingCouponId(null);
      showToast('warning', 'Kupon silindi');
      fetchCoupons();
    } catch (error) {
      console.error('Error deleting coupon:', error);
      showToast('error', 'Kupon silinirken hata oluştu.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const getTypeLabel = (type: CouponType) => {
    return type === 'PERCENTAGE' ? '% İndirim' : 'Sabit Tutar';
  };

  const isExpired = (coupon: Coupon) => {
    return new Date(coupon.validUntil) < new Date();
  };

  const isUsageExhausted = (coupon: Coupon) => {
    return coupon.usageLimit != null && coupon.usedCount >= coupon.usageLimit;
  };

  return (
    <div className="space-y-8 animate-fade-in">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-extrabold text-black tracking-tight">Kupon Yönetimi</h1>
          <p className="text-slate-400 text-sm mt-1">Mağazanızdaki indirim kuponlarını oluşturun ve yönetin.</p>
        </div>
        <button
          onClick={handleOpenAddModal}
          className="bg-indigo-650 hover:bg-indigo-600 text- font-bold py-2.5 px-5 rounded-lg text-sm flex items-center space-x-1.5 transition-colors shadow-md shadow-indigo-500/10 cursor-pointer"
        >
          <Plus className="w-4 h-4 text-slate-955 stroke-[3]" />
          <span>Yeni Kupon Ekle</span>
        </button>
      </div>

      {isLoading ? (
        <div className="flex flex-col items-center justify-center py-20 bg-slate-900/30 rounded-2xl border border-slate-855">
          <RefreshCw className="w-10 h-10 text-indigo-600 animate-spin" />
          <p className="text-slate-400 text-sm font-semibold mt-4">Kuponlar Yükleniyor...</p>
        </div>
      ) : coupons.length === 0 ? (
        <div className="bg-slate-900/30 border border-slate-800 rounded-2xl p-16 text-center">
          <Tag className="w-12 h-12 text-slate-600 mx-auto mb-4" />
          <p className="text-slate-400 text-sm font-medium">Henüz kupon oluşturulmamış.</p>
        </div>
      ) : (
        <div className="bg-slate-900 border border-slate-800 rounded-xl overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-850 text-slate-400 text-xs uppercase font-bold border-b border-slate-800">
                  <th className="py-4 px-6">Kupon</th>
                  <th className="py-4 px-6">Tip</th>
                  <th className="py-4 px-6 text-right">Değer</th>
                  <th className="py-4 px-6 text-center">Kullanım</th>
                  <th className="py-4 px-6">Geçerlilik</th>
                  <th className="py-4 px-6 text-center">Durum</th>
                  <th className="py-4 px-6 text-center">İşlemler</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800 text-sm">
                {coupons.map((coupon) => (
                  <tr
                    key={coupon.id}
                    className={`border border-slate-800 hover:bg-slate-850/50 transition-colors ${
                      isExpired(coupon) ? 'opacity-60 bg-slate-900/60' : ''
                    }`}
                  >
                    <td className="py-4 px-6">
                      <p className="font-mono font-bold text-indigo-600">{coupon.code}</p>
                      {coupon.description && (
                        <p className="text-slate-500 text-xs mt-0.5 line-clamp-1 max-w-sm">{coupon.description}</p>
                      )}
                    </td>
                    <td className="py-4 px-6">
                      <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-semibold border ${
                        coupon.type === 'PERCENTAGE'
                          ? 'bg-blue-500/10 border-blue-500/30 text-blue-400'
                          : 'bg-purple-500/10 border-purple-500/30 text-purple-400'
                      }`}>
                        {getTypeLabel(coupon.type)}
                      </span>
                    </td>
                    <td className="py-4 px-6 text-right font-bold text-black">
                      {coupon.type === 'PERCENTAGE'
                        ? `%${coupon.discountValue}`
                        : `${coupon.discountValue.toLocaleString('tr-TR')} TL`}
                    </td>
                    <td className="py-4 px-6 text-center font-semibold">
                      <span className={isUsageExhausted(coupon) ? 'text-red-400' : 'text-slate-300'}>
                        {coupon.usedCount}{coupon.usageLimit != null ? ` / ${coupon.usageLimit}` : ''}
                      </span>
                    </td>
                    <td className="py-4 px-6 text-slate-300 text-xs font-medium">
                      <div>{new Date(coupon.validFrom).toLocaleDateString('tr-TR')}</div>
                      <div className="text-slate-500">→ {new Date(coupon.validUntil).toLocaleDateString('tr-TR')}</div>
                    </td>
                    <td className="py-4 px-6 text-center">
                      {isExpired(coupon) ? (
                        <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-semibold bg-slate-800 border border-slate-700 text-slate-400">
                          Süresi Doldu
                        </span>
                      ) : coupon.active ? (
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
                          onClick={() => handleOpenEditModal(coupon)}
                          className="p-1.5 bg-slate-800 hover:bg-slate-700 border border-slate-750 text-indigo-600 hover:text-indigo-500 rounded-lg transition-colors cursor-pointer"
                          title="Düzenle"
                        >
                          <Edit2 className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => setDeletingCouponId(coupon.id)}
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
          <div className="bg-slate-900 border border-slate-800 rounded-2xl max-w-lg w-full p-6 shadow-2xl relative z-10 space-y-6">
            <div className="flex justify-between items-center pb-">
              <h3 className="text-xl font-bold text-black">
                {editingCoupon ? 'Kuponu Düzenle' : 'Yeni Kupon Ekle'}
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
                <label className="block text-slate-350 font-semibold mb-1.5" htmlFor="code">
                  Kupon Kodu
                </label>
                <input
                  id="code"
                  type="text"
                  placeholder="YAZ2026"
                  disabled={!!editingCoupon}
                  {...register('code')}
                  className={`w-full bg-slate-950 border ${
                    errors.code ? 'border-red-500' : 'border-slate-800'
                  } rounded-lg py-2 px-3.5 text-black placeholder-slate-400 focus:outline-none focus:border-indigo-600 transition-colors uppercase disabled:opacity-50 disabled:cursor-not-allowed`}
                />
                {errors.code && (
                  <span className="text-red-400 text-xs mt-1 block">{errors.code.message}</span>
                )}
              </div>

              <div>
                <label className="block text-slate-350 font-semibold mb-1.5" htmlFor="description">
                  Açıklama
                </label>
                <input
                  id="description"
                  type="text"
                  placeholder="Yaz kampanyası indirimi"
                  {...register('description')}
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg py-2 px-3.5 text-black placeholder-slate-400 focus:outline-none focus:border-indigo-600 transition-colors"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-slate-350 font-semibold mb-1.5" htmlFor="type">
                    İndirim Tipi
                  </label>
                  <select
                    id="type"
                    {...register('type')}
                    className="w-full bg-slate-950 border border-slate-800 text-black rounded-lg py-2 px-3.5 focus:outline-none focus:border-indigo-600 transition-colors"
                  >
                    <option value="PERCENTAGE">% Yüzdesel</option>
                    <option value="FIXED_AMOUNT">Sabit Tutar</option>
                  </select>
                </div>

                <div>
                  <label className="block text-slate-350 font-semibold mb-1.5" htmlFor="discountValue">
                    {couponType === 'PERCENTAGE' ? 'İndirim %' : 'İndirim Tutarı (TL)'}
                  </label>
                  <input
                    id="discountValue"
                    type="number"
                    step="0.01"
                    placeholder={couponType === 'PERCENTAGE' ? '20' : '50'}
                    {...register('discountValue', { valueAsNumber: true })}
                    className={`w-full bg-slate-950 border ${
                      errors.discountValue ? 'border-red-500' : 'border-slate-800'
                    } rounded-lg py-2 px-3.5 text-black placeholder-slate-400 focus:outline-none focus:border-indigo-600 transition-colors`}
                  />
                  {errors.discountValue && (
                    <span className="text-red-400 text-xs mt-1 block">{errors.discountValue.message}</span>
                  )}
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-slate-350 font-semibold mb-1.5" htmlFor="minimumOrderAmount">
                    Min. Sepet Tutarı (TL)
                  </label>
                  <input
                    id="minimumOrderAmount"
                    type="number"
                    step="0.01"
                    placeholder="500"
                    {...register('minimumOrderAmount', { valueAsNumber: true })}
                    className={`w-full bg-slate-950 border ${
                      errors.minimumOrderAmount ? 'border-red-500' : 'border-slate-800'
                    } rounded-lg py-2 px-3.5 text-black placeholder-slate-400 focus:outline-none focus:border-indigo-600 transition-colors`}
                  />
                  {errors.minimumOrderAmount && (
                    <span className="text-red-400 text-xs mt-1 block">{errors.minimumOrderAmount.message}</span>
                  )}
                </div>

                {couponType === 'PERCENTAGE' && (
                  <div>
                    <label className="block text-slate-350 font-semibold mb-1.5" htmlFor="maximumDiscountAmount">
                      Maks. İndirim (TL)
                    </label>
                    <input
                      id="maximumDiscountAmount"
                      type="number"
                      step="0.01"
                      placeholder="200"
                      {...register('maximumDiscountAmount', { valueAsNumber: true })}
                      className={`w-full bg-slate-950 border ${
                        errors.maximumDiscountAmount ? 'border-red-500' : 'border-slate-800'
                      } rounded-lg py-2 px-3.5 text-black placeholder-slate-400 focus:outline-none focus:border-indigo-600 transition-colors`}
                    />
                    {errors.maximumDiscountAmount && (
                      <span className="text-red-400 text-xs mt-1 block">{errors.maximumDiscountAmount.message}</span>
                    )}
                  </div>
                )}
              </div>

              <div>
                <label className="block text-slate-350 font-semibold mb-1.5" htmlFor="usageLimit">
                  Kullanım Limiti (Boş = Sınırsız)
                </label>
                <input
                  id="usageLimit"
                  type="number"
                  step="1"
                  placeholder="100"
                  {...register('usageLimit', { valueAsNumber: true })}
                  className={`w-full bg-slate-950 border ${
                    errors.usageLimit ? 'border-red-500' : 'border-slate-800'
                  } rounded-lg py-2 px-3.5 text-black placeholder-slate-400 focus:outline-none focus:border-indigo-600 transition-colors`}
                />
                {errors.usageLimit && (
                  <span className="text-red-400 text-xs mt-1 block">{errors.usageLimit.message}</span>
                )}
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-slate-350 font-semibold mb-1.5" htmlFor="validFrom">
                    Başlangıç Tarihi
                  </label>
                  <input
                    id="validFrom"
                    type="datetime-local"
                    {...register('validFrom')}
                    className={`w-full bg-slate-950 border ${
                      errors.validFrom ? 'border-red-500' : 'border-slate-800'
                    } rounded-lg py-2 px-3.5 text-black focus:outline-none focus:border-indigo-600 transition-colors`}
                  />
                  {errors.validFrom && (
                    <span className="text-red-400 text-xs mt-1 block">{errors.validFrom.message}</span>
                  )}
                </div>

                <div>
                  <label className="block text-slate-350 font-semibold mb-1.5" htmlFor="validUntil">
                    Bitiş Tarihi
                  </label>
                  <input
                    id="validUntil"
                    type="datetime-local"
                    {...register('validUntil')}
                    className={`w-full bg-slate-950 border ${
                      errors.validUntil ? 'border-red-500' : 'border-slate-800'
                    } rounded-lg py-2 px-3.5 text-black focus:outline-none focus:border-indigo-600 transition-colors`}
                  />
                  {errors.validUntil && (
                    <span className="text-red-400 text-xs mt-1 block">{errors.validUntil.message}</span>
                  )}
                </div>
              </div>

              {editingCoupon && (
                <div className="flex items-center space-x-2 pt-2 select-none">
                  <input
                    id="active"
                    type="checkbox"
                    {...register('active')}
                    className="w-4 h-4 bg-slate-950 border border-slate-800 text-indigo-600 focus:ring-0 rounded-md cursor-pointer"
                  />
                  <label htmlFor="active" className="text-slate-300 font-semibold cursor-pointer">
                    Kupon Aktif
                  </label>
                </div>
              )}

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

      {/* Delete Confirmation Modal */}
      {deletingCouponId && (
        <div className="fixed inset-0 z-50 overflow-hidden flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/60 backdrop-blur-xs" onClick={() => setDeletingCouponId(null)} />
          <div className="bg-slate-900 border border-slate-800 rounded-2xl max-w-md w-full p-6 text-center space-y-6 shadow-2xl relative z-10">
            <div className="flex justify-center">
              <div className="bg-red-500/10 border border-red-500/35 p-3 rounded-full text-red-400">
                <AlertCircle className="w-12 h-12" />
              </div>
            </div>
            <div className="space-y-2">
              <h3 className="text-lg font-bold text-black">Kuponu Sil</h3>
              <p className="text-slate-405 text-xs leading-relaxed">
                Bu kuponu silmek istediğinize emin misiniz? Bu işlem geri alınamaz.
              </p>
            </div>
            <div className="flex space-x-3 pt-2">
              <button
                onClick={() => setDeletingCouponId(null)}
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
                  <span>Sil</span>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};