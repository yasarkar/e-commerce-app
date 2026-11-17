import React, { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useNavigate, Link } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import { useToast } from '../context/ToastContext';
import { orderService } from '../api/orderService';
import { addressService } from '../api/addressService';
import { CouponInput } from '../components/coupon/CouponInput';
import { CreditCard, MapPin, ShoppingBag, ArrowLeft, AlertCircle, Tag, Home, Briefcase, Building2 } from 'lucide-react';
import type { ErrorResponse, CouponValidation, Address } from '../types';

const addressSchema = z.object({
  street: z.string().min(3, 'Adres/Sokak bilgisi en az 3 karakter olmalıdır'),
  city: z.string().min(2, 'Şehir en az 2 karakter olmalıdır'),
  zipCode: z.string().min(5, 'Posta kodu en az 5 karakter olmalıdır'),
  country: z.string().min(2, 'Ülke en az 2 karakter olmalıdır'),
});

type AddressFormData = z.infer<typeof addressSchema>;

const getLabelIcon = (label?: string) => {
  switch (label) {
    case 'Ev':
      return <Home className="w-4 h-4" />;
    case 'İş':
      return <Briefcase className="w-4 h-4" />;
    case 'Diğer':
      return <Building2 className="w-4 h-4" />;
    default:
      return <MapPin className="w-4 h-4" />;
  }
};

export const Checkout: React.FC = () => {
  const { cart, fetchCart } = useCart();
  const { showToast } = useToast();
  const navigate = useNavigate();
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [appliedCoupon, setAppliedCoupon] = useState<CouponValidation | null>(null);

  // Saved addresses
  const [savedAddresses, setSavedAddresses] = useState<Address[]>([]);
  const [isAddressesLoading, setIsAddressesLoading] = useState(true);
  const [selectedAddressIndex, setSelectedAddressIndex] = useState<number | null>(null);

  const {
    register,
    handleSubmit,
    setValue,
    formState: { errors },
  } = useForm<AddressFormData>({
    resolver: zodResolver(addressSchema),
  });

  useEffect(() => {
    const fetchAddresses = async () => {
      setIsAddressesLoading(true);
      try {
        const response = await addressService.getAddresses();
        setSavedAddresses(response.data || []);
      } catch (error) {
        console.error('Error fetching saved addresses:', error);
      } finally {
        setIsAddressesLoading(false);
      }
    };
    fetchAddresses();
  }, []);

  const handleSelectAddress = (index: number) => {
    const address = savedAddresses[index];
    if (!address) return;
    setSelectedAddressIndex(index);
    setValue('street', address.street);
    setValue('city', address.city);
    setValue('zipCode', address.zipCode);
    setValue('country', address.country);
  };

  const onSubmit = async (data: AddressFormData) => {
    setErrorMessage(null);
    setIsSubmitting(true);
    try {
      const response = await orderService.createOrder({
        shippingAddress: data,
        items: cart?.items.map((item) => ({
          productId: item.productId,
          quantity: item.quantity,
        })) || [],
        couponCode: appliedCoupon?.code,
      });
      // Order created successfully, reload/clear the cart
      await fetchCart();
      showToast('success', 'Siparişiniz başarıyla oluşturuldu! 🎉');
      navigate(`/order-success/${response.data.id}`);
    } catch (error: any) {
      console.error('Order creation error:', error);
      if (error.response?.data) {
        const errorData = error.response.data as ErrorResponse;
        setErrorMessage(errorData.message || 'Sipariş oluşturulurken bir hata oluştu.');
        showToast('error', errorData.message || 'Sipariş oluşturulurken bir hata oluştu.');
      } else {
        setErrorMessage('Sipariş iletilemedi. Lütfen daha sonra tekrar deneyin.');
        showToast('error', 'Sipariş oluşturulurken bir hata oluştu.');
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCouponApplied = (coupon: CouponValidation) => {
    setAppliedCoupon(coupon);
  };

  const handleCouponRemoved = () => {
    setAppliedCoupon(null);
  };

  const finalTotal = cart && appliedCoupon
    ? cart.totalAmount - appliedCoupon.calculatedDiscount
    : cart?.totalAmount ?? 0;

  if (!cart || cart.items.length === 0) {
    return (
      <div className="flex-grow flex items-center justify-center p-6 bg-slate-955 text-slate-800">
        <div className="max-w-md w-full bg-slate-800 border border-slate-700 rounded-2xl p-8 text-center shadow-xl">
          <ShoppingBag className="w-12 h-12 text-slate-400 mx-auto mb-4" />
          <h2 className="text-xl font-bold text-slate-900 mb-2">Sepetiniz Boş</h2>
          <p className="text-slate-500 text-sm mb-6">Sipariş verebilmek için sepetinize ürün eklemelisiniz.</p>
          <Link
            to="/"
            className="inline-flex items-center space-x-2 bg-indigo-600 hover:bg-indigo-500 text-white font-semibold py-2.5 px-6 rounded-lg transition-colors cursor-pointer"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Alışverişe Başla</span>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-slate-955 text-slate-800 flex-grow">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight mb-8">Siparişi Tamamla</h1>

        {errorMessage && (
          <div className="bg-red-500/10 border border-red-500/50 rounded-lg p-4 mb-6 flex items-start space-x-3 text-red-700 text-sm max-w-3xl">
            <AlertCircle className="w-5 h-5 text-red-500 shrink-0 mt-0.5" />
            <div>
              <p className="font-semibold">Hata</p>
              <p>{errorMessage}</p>
            </div>
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
          {/* Form Area */}
          <div className="lg:col-span-2 space-y-6">
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
              {/* Delivery Address Section */}
              <div className="bg-slate-800 rounded-xl p-6 border border-slate-700">
                <h3 className="text-lg font-bold mb-4 flex items-center space-x-2 text-indigo-600">
                  <MapPin className="w-5 h-5" />
                  <span>Teslimat Adresi</span>
                </h3>

                {/* Saved Addresses Selection */}
                {isAddressesLoading ? (
                  <div className="flex justify-center py-4 mb-4">
                    <div className="w-6 h-6 border-2 border-indigo-650 border-t-transparent rounded-full animate-spin"></div>
                  </div>
                ) : savedAddresses.length > 0 ? (
                  <div className="mb-6">
                    <label className="block text-slate-500 text-sm font-semibold mb-2">
                      Kayıtlı Adreslerinizden Seçin
                    </label>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      {savedAddresses.map((address, index) => (
                        <button
                          key={index}
                          type="button"
                          onClick={() => handleSelectAddress(index)}
                          className={`text-left p-3 rounded-lg border transition-all cursor-pointer ${
                            selectedAddressIndex === index
                              ? 'bg-indigo-500/10 border-indigo-500/40 text-indigo-600'
                              : 'bg-slate-900 border-slate-700 hover:border-indigo-500/40'
                          }`}
                        >
                          <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-semibold mb-1.5 ${
                            selectedAddressIndex === index
                              ? 'bg-indigo-500/10 border border-indigo-500/30 text-indigo-400'
                              : 'bg-slate-800 border border-slate-700 text-slate-300'
                          }`}>
                            {getLabelIcon(address.label)}
                            <span className="ml-1">{address.label || 'Adres'}</span>
                          </span>
                          <p className="text-xs text-slate-500 leading-relaxed">{address.street}</p>
                          <p className="text-xs text-slate-500 mt-0.5">{address.zipCode} {address.city}/{address.country}</p>
                        </button>
                      ))}
                    </div>
                    {selectedAddressIndex !== null && (
                      <p className="mt-2 text-xs text-emerald-600 font-semibold flex items-center space-x-1">
                        <Tag className="w-3 h-3" />
                        <span>Seçilen adres form alanlarına otomatik dolduruldu. Dilerseniz elle düzenleyebilirsiniz.</span>
                      </p>
                    )}
                  </div>
                ) : null}

                <div className="space-y-4">
                  <div>
                    <label className="block text-slate-500 text-sm font-semibold mb-1.5" htmlFor="street">
                      Açık Adres (Sokak, Apartman No, Daire)
                    </label>
                    <input
                      id="street"
                      type="text"
                      placeholder="Atatürk Cad. No:12 Daire:4"
                      {...register('street')}
                      className={`w-full bg-slate-900 border ${errors.street ? 'border-red-500' : 'border-slate-700'
                        } rounded-lg py-2 px-3.5 text-slate-800 placeholder-slate-455 focus:outline-none focus:border-indigo-500 transition-colors text-sm`}
                    />
                    {errors.street && (
                      <span className="text-red-550 text-xs mt-1 block">{errors.street.message}</span>
                    )}
                  </div>

                  <div className="grid grid-cols-3 gap-4">
                    <div className="col-span-1">
                      <label className="block text-slate-500 text-sm font-semibold mb-1.5" htmlFor="city">
                        Şehir
                      </label>
                      <input
                        id="city"
                        type="text"
                        placeholder="İstanbul"
                        {...register('city')}
                        className={`w-full bg-slate-900 border ${errors.city ? 'border-red-500' : 'border-slate-700'
                          } rounded-lg py-2 px-3.5 text-slate-800 placeholder-slate-455 focus:outline-none focus:border-indigo-500 transition-colors text-sm`}
                      />
                      {errors.city && (
                        <span className="text-red-550 text-xs mt-1 block">{errors.city.message}</span>
                      )}
                    </div>

                    <div className="col-span-1">
                      <label className="block text-slate-500 text-sm font-semibold mb-1.5" htmlFor="zipCode">
                        Posta Kodu
                      </label>
                      <input
                        id="zipCode"
                        type="text"
                        placeholder="34000"
                        {...register('zipCode')}
                        className={`w-full bg-slate-900 border ${errors.zipCode ? 'border-red-500' : 'border-slate-700'
                          } rounded-lg py-2 px-3.5 text-slate-800 placeholder-slate-455 focus:outline-none focus:border-indigo-500 transition-colors text-sm`}
                      />
                      {errors.zipCode && (
                        <span className="text-red-550 text-xs mt-1 block">{errors.zipCode.message}</span>
                      )}
                    </div>

                    <div className="col-span-1">
                      <label className="block text-slate-500 text-sm font-semibold mb-1.5" htmlFor="country">
                        Ülke
                      </label>
                      <input
                        id="country"
                        type="text"
                        placeholder="Türkiye"
                        {...register('country')}
                        className={`w-full bg-slate-900 border ${errors.country ? 'border-red-500' : 'border-slate-700'
                          } rounded-lg py-2 px-3.5 text-slate-800 placeholder-slate-455 focus:outline-none focus:border-indigo-500 transition-colors text-sm`}
                      />
                      {errors.country && (
                        <span className="text-red-550 text-xs mt-1 block">{errors.country.message}</span>
                      )}
                    </div>
                  </div>
                </div>
              </div>

              {/* Coupon Section */}
              <div className="bg-slate-800 rounded-xl p-6 border border-slate-700">
                <h3 className="text-lg font-bold mb-4 flex items-center space-x-2 text-indigo-600">
                  <Tag className="w-5 h-5" />
                  <span>İndirim Kuponu</span>
                </h3>
                <CouponInput
                  cartTotal={cart.totalAmount}
                  onCouponApplied={handleCouponApplied}
                  onCouponRemoved={handleCouponRemoved}
                  appliedCoupon={appliedCoupon}
                />
              </div>

              {/* Payment Section (Mock) */}
              <div className="bg-slate-800 rounded-xl p-6 border border-slate-700">
                <h3 className="text-lg font-bold mb-4 flex items-center space-x-2 text-indigo-600">
                  <CreditCard className="w-5 h-5" />
                  <span>Ödeme Bilgileri</span>
                </h3>
                <div className="p-4 bg-indigo-500/10 border border-indigo-500/20 rounded-lg text-sm text-indigo-605">
                  <p className="font-semibold text-indigo-600">Kapıda Ödeme & Güvenli Tahsilat</p>
                  <p className="mt-1 text-xs text-slate-500">
                    Ödemeniz, teslimat adresinize siparişiniz ulaştığında nakit veya kartla tahsil edilecektir.
                  </p>
                </div>
              </div>

              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full bg-indigo-650 hover:bg-indigo-600 disabled:bg-indigo-700 text-white font-semibold py-3.5 px-6 rounded-lg transition-colors shadow-md shadow-indigo-500/20 flex items-center justify-center space-x-2 cursor-pointer text-sm"
              >
                {isSubmitting ? (
                  <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                ) : (
                  <span>Siparişi Onayla ve Tamamla</span>
                )}
              </button>
            </form>
          </div>

          {/* Cart Summary Card */}
          <div className="lg:col-span-1 bg-slate-800 rounded-xl p-6 border border-slate-700 space-y-6">
            <h3 className="text-lg font-bold border-b border-slate-700 pb-4 text-slate-900">Sipariş Özetiniz</h3>

            <div className="divide-y divide-slate-750 max-h-96 overflow-y-auto pr-1">
              {cart.items.map((item) => (
                <div key={item.productId} className="flex justify-between py-3.5 border-b border-slate-700 text-sm first:pt-0">
                  <div className="max-w-[70%]">
                    <p className="font-semibold text-slate-900 truncate">{item.productName}</p>
                    <p className="text-slate-500 text-xs mt-0.5">{item.quantity} Adet × {item.price.toLocaleString('tr-TR')} TL</p>
                  </div>
                  <span className="font-bold text-slate-900 shrink-0">
                    {item.subTotal.toLocaleString('tr-TR', { style: 'currency', currency: 'TRY' })}
                  </span>
                </div>
              ))}
            </div>

            <div className="border-t border-slate-700 pt-4 space-y-2">
              <div className="flex justify-between text-sm text-slate-500">
                <span>Ara Toplam</span>
                <span>{cart.totalAmount.toLocaleString('tr-TR')} TL</span>
              </div>
              {appliedCoupon && (
                <div className="flex justify-between text-sm">
                  <span className="text-emerald-600 font-semibold flex items-center space-x-1">
                    <span>Kupon ({appliedCoupon.code})</span>
                  </span>
                  <span className="text-emerald-600 font-bold">
                    -{appliedCoupon.calculatedDiscount.toLocaleString('tr-TR')} TL
                  </span>
                </div>
              )}
              <div className="flex justify-between text-sm text-slate-500">
                <span>Kargo</span>
                <span className="text-emerald-600 font-semibold">Ücretsiz</span>
              </div>
              <div className="flex justify-between items-baseline pt-2 border-t border-slate-700/50">
                <span className="font-bold text-slate-900 text-base">Toplam Tutar</span>
                <span className="font-black text-xl text-indigo-600">
                  {finalTotal.toLocaleString('tr-TR', { style: 'currency', currency: 'TRY' })}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};