import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { orderService } from '../api/orderService';
import { addressService } from '../api/addressService';
import type { Order, OrderStatus, Address } from '../types';
import { Pagination } from '../components/common/Pagination';
import { User as UserIcon, Shield, Package, Trash2, Calendar, MapPin, AlertCircle, Tag, Plus, Edit2, Home, Briefcase, Building2, X } from 'lucide-react';

const ADDRESS_LABELS = ['Ev', 'İş', 'Diğer'] as const;

const EMPTY_ADDRESS: Address = {
  label: 'Ev',
  street: '',
  city: '',
  zipCode: '',
  country: 'Türkiye',
};

export const Profile: React.FC = () => {
  const { user } = useAuth();
  const { showToast } = useToast();
  const [orders, setOrders] = useState<Order[]>([]);
  const [currentPage, setCurrentPage] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [cancelTargetOrderId, setCancelTargetOrderId] = useState<string | null>(null);
  const [isCancelling, setIsCancelling] = useState(false);

  // Address management state
  const [addresses, setAddresses] = useState<Address[]>([]);
  const [isAddressesLoading, setIsAddressesLoading] = useState(true);
  const [isAddressModalOpen, setIsAddressModalOpen] = useState(false);
  const [editingAddressIndex, setEditingAddressIndex] = useState<number | null>(null);
  const [addressForm, setAddressForm] = useState<Address>(EMPTY_ADDRESS);
  const [isAddressSaving, setIsAddressSaving] = useState(false);
  const [deleteAddressIndex, setDeleteAddressIndex] = useState<number | null>(null);
  const [isAddressDeleting, setIsAddressDeleting] = useState(false);

  const fetchOrders = async (page = 0) => {
    setIsLoading(true);
    try {
      const response = await orderService.getMyOrders(page, 5);
      setOrders(response.data.content);
      setTotalPages(response.data.totalPages);
      setCurrentPage(response.data.number);
    } catch (error) {
      console.error('Error fetching orders:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const fetchAddresses = async () => {
    setIsAddressesLoading(true);
    try {
      const response = await addressService.getAddresses();
      setAddresses(response.data || []);
    } catch (error) {
      console.error('Error fetching addresses:', error);
    } finally {
      setIsAddressesLoading(false);
    }
  };

  useEffect(() => {
    fetchOrders(0);
    fetchAddresses();
  }, []);

  const handlePageChange = (page: number) => {
    fetchOrders(page);
  };

  const handleCancelOrderClick = (orderId: string) => {
    setCancelTargetOrderId(orderId);
  };

  const handleConfirmCancel = async () => {
    if (!cancelTargetOrderId) return;
    setIsCancelling(true);
    try {
      await orderService.cancelOrder(cancelTargetOrderId);
      setCancelTargetOrderId(null);
      await fetchOrders(currentPage);
      showToast('warning', 'Siparişiniz iptal edildi');
    } catch (error) {
      console.error('Error cancelling order:', error);
      showToast('error', 'Sipariş iptal edilirken bir hata oluştu.');
    } finally {
      setIsCancelling(false);
    }
  };

  // Address handlers
  const openAddAddressModal = () => {
    setEditingAddressIndex(null);
    setAddressForm(EMPTY_ADDRESS);
    setIsAddressModalOpen(true);
  };

  const openEditAddressModal = (index: number) => {
    setEditingAddressIndex(index);
    setAddressForm({ ...addresses[index] });
    setIsAddressModalOpen(true);
  };

  const handleAddressSave = async () => {
    if (!addressForm.street.trim() || !addressForm.city.trim() || !addressForm.zipCode.trim() || !addressForm.country.trim()) {
      showToast('error', 'Lütfen tüm adres alanlarını doldurun.');
      return;
    }
    setIsAddressSaving(true);
    try {
      if (editingAddressIndex !== null) {
        await addressService.updateAddress(editingAddressIndex, addressForm);
        showToast('success', 'Adres başarıyla güncellendi');
      } else {
        await addressService.addAddress(addressForm);
        showToast('success', 'Adres başarıyla eklendi');
      }
      setIsAddressModalOpen(false);
      fetchAddresses();
    } catch (error: any) {
      console.error('Error saving address:', error);
      showToast('error', error.response?.data?.message || 'Adres kaydedilirken bir hata oluştu.');
    } finally {
      setIsAddressSaving(false);
    }
  };

  const handleDeleteAddress = async () => {
    if (deleteAddressIndex === null) return;
    setIsAddressDeleting(true);
    try {
      await addressService.deleteAddress(deleteAddressIndex);
      setDeleteAddressIndex(null);
      fetchAddresses();
      showToast('success', 'Adres başarıyla silindi');
    } catch (error: any) {
      console.error('Error deleting address:', error);
      showToast('error', error.response?.data?.message || 'Adres silinirken bir hata oluştu.');
    } finally {
      setIsAddressDeleting(false);
    }
  };

  const getLabelIcon = (label?: string) => {
    switch (label) {
      case 'Ev':
        return <Home className="w-3.5 h-3.5" />;
      case 'İş':
        return <Briefcase className="w-3.5 h-3.5" />;
      case 'Diğer':
        return <Building2 className="w-3.5 h-3.5" />;
      default:
        return <MapPin className="w-3.5 h-3.5" />;
    }
  };

  const getStatusBadge = (status: OrderStatus) => {
    const styles = {
      PENDING: 'bg-amber-500/10 border-amber-500/30 text-amber-400',
      PROCESSING: 'bg-blue-500/10 border-blue-500/30 text-blue-400',
      SHIPPED: 'bg-purple-500/10 border-purple-500/30 text-purple-400',
      DELIVERED: 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400',
      CANCELLED: 'bg-red-500/10 border-red-500/30 text-red-400',
    };

    const statusTexts = {
      PENDING: 'Beklemede',
      PROCESSING: 'Hazırlanıyor',
      SHIPPED: 'Kargoya Verildi',
      DELIVERED: 'Teslim Edildi',
      CANCELLED: 'İptal Edildi',
    };

    return (
      <span className={`inline-flex items-center border px-2.5 py-1 rounded-md text-xs font-semibold tracking-wide ${styles[status]}`}>
        {statusTexts[status] || status}
      </span>
    );
  };

  return (
    <div className="bg-slate-955 text-slate-800 flex-grow">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">

        {/* Profile Header + Addresses Panel */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* User Info Card */}
          <div className="lg:col-span-2 bg-slate-800 rounded-2xl p-6 border border-slate-700 flex flex-col md:flex-row items-center md:items-start md:space-x-6 space-y-4 md:space-y-0">
            <div className="bg-indigo-500/10 border border-indigo-500/20 p-5 rounded-full text-indigo-600">
              <UserIcon className="w-16 h-16" />
            </div>
            <div className="flex-1 text-center md:text-left space-y-2">
              <h2 className="text-2xl font-black text-slate-900">{user?.firstName} {user?.lastName}</h2>
              <p className="text-slate-500 text-sm font-mono">{user?.email}</p>
              <div className="flex flex-wrap justify-center md:justify-start gap-2 pt-1">
                {user?.role && (
                  <span className="bg-indigo-500/10 border border-indigo-500/20 text-indigo-600 text-xs px-2.5 py-1 rounded-md font-semibold tracking-wide flex items-center space-x-1.5">
                    <Shield className="w-3.5 h-3.5" />
                    <span>{user.role === 'ROLE_ADMIN' ? 'Admin' : 'Müşteri'}</span>
                  </span>
                )}
              </div>
            </div>
          </div>

          {/* Addresses Panel */}
          <div className="bg-slate-800 rounded-2xl p-6 border border-slate-700">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-bold flex items-center space-x-2 text-indigo-600">
                <MapPin className="w-5 h-5" />
                <span>Adreslerim</span>
              </h3>
              <button
                onClick={openAddAddressModal}
                className="p-1.5 bg-indigo-500/10 border border-indigo-500/30 hover:bg-indigo-500/20 text-indigo-600 rounded-lg transition-colors cursor-pointer"
                title="Adres Ekle"
              >
                <Plus className="w-4 h-4" />
              </button>
            </div>

            {isAddressesLoading ? (
              <div className="flex justify-center py-8">
                <div className="w-8 h-8 border-3 border-indigo-650 border-t-transparent rounded-full animate-spin"></div>
              </div>
            ) : addresses.length === 0 ? (
              <div className="text-center py-8">
                <MapPin className="w-10 h-10 text-slate-400 mx-auto mb-3" />
                <p className="text-slate-500 text-sm">Henüz kayıtlı adresiniz yok.</p>
                <button
                  onClick={openAddAddressModal}
                  className="mt-3 text-indigo-600 text-sm font-semibold hover:text-indigo-500 cursor-pointer"
                >
                  + İlk adresinizi ekleyin
                </button>
              </div>
            ) : (
              // Dikey kaydırmalı adres listesi:
              // Panel yüksekliği en fazla 1 adres boyutu kadar sabit kalır,
              // 2. adres eklenince altta dikey kaydırma çubuğu (aşağı-yukarı) belirir.
              <div className="overflow-y-auto max-h-28 pr-1 -mr-1 scrollbar-thin">
                <div className="space-y-3">
                  {addresses.map((address, index) => (
                    <div key={index} className="w-full bg-slate-900 border border-slate-750 rounded-lg p-3 group">
                      <div className="flex items-start justify-between gap-2">
                        <div className="flex items-center space-x-2 mb-1.5">
                          <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-semibold bg-indigo-500/10 border border-indigo-500/30 text-indigo-400">
                            {getLabelIcon(address.label)}
                            <span className="ml-1">{address.label || 'Adres'}</span>
                          </span>
                        </div>
                        <div className="flex items-center space-x-1 opacity-0 group-hover:opacity-100 transition-opacity">
                          <button
                            onClick={() => openEditAddressModal(index)}
                            className="p-1 bg-slate-800 hover:bg-slate-700 border border-slate-700 text-slate-300 rounded-md transition-colors cursor-pointer"
                            title="Düzenle"
                          >
                            <Edit2 className="w-3 h-3" />
                          </button>
                          <button
                            onClick={() => setDeleteAddressIndex(index)}
                            className="p-1 bg-slate-800 hover:bg-slate-700 border border-slate-700 text-red-500 rounded-md transition-colors cursor-pointer"
                            title="Sil"
                          >
                            <Trash2 className="w-3 h-3" />
                          </button>
                        </div>
                      </div>
                      <p className="text-slate-300 text-xs leading-relaxed">{address.street}</p>
                      <p className="text-slate-500 text-xs mt-0.5">{address.zipCode} {address.city}/{address.country}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>

        <div className="space-y-6">
          <h3 className="text-xl font-bold flex items-center space-x-2.5 text-indigo-600">
            <Package className="w-6 h-6" />
            <span>Sipariş Geçmişim</span>
          </h3>

          {isLoading ? (
            <div className="flex justify-center py-20 bg-slate-900/30 rounded-2xl border border-slate-800">
              <div className="flex flex-col items-center space-y-3">
                <div className="w-10 h-10 border-3 border-indigo-650 border-t-transparent rounded-full animate-spin"></div>
                <p className="text-slate-550 text-sm font-medium">Siparişler yükleniyor...</p>
              </div>
            </div>
          ) : orders.length === 0 ? (
            <div className="bg-slate-900/30 border border-slate-800 rounded-2xl p-16 text-center">
              <Package className="w-12 h-12 text-slate-400 mx-auto mb-4" />
              <p className="text-slate-550 text-sm font-medium">Henüz bir sipariş kaydınız bulunmuyor.</p>
            </div>
          ) : (
            <div className="space-y-6">
              <div className="space-y-4">
                {orders.map((order) => (
                  <div key={order.id} className="bg-slate-800 border border-slate-700 rounded-xl overflow-hidden">
                    <div className="bg-slate-850 p-4 border-b border-slate-750 flex flex-wrap justify-between items-center gap-4 text-sm text-slate-500 font-medium">
                      <div className="flex items-center space-x-6">
                        <div>
                          <span className="text-slate-400 text-x block uppercase">Sipariş No</span>
                          <span className="font-mono text-slate-900 text-xs">{order.id}</span>
                        </div>
                        <div>
                          <span className="text-slate-400 text-x block uppercase">Tarih</span>
                          <span className="text-slate-900 text-xs flex items-center space-x-1">
                            <Calendar className="w-3.5 h-3.5 text-slate-400" />
                            <span>{new Date(order.orderDate).toLocaleDateString('tr-TR')}</span>
                          </span>
                        </div>
                      </div>
                      <div className="flex items-center space-x-3">
                        {getStatusBadge(order.status)}
                        {order.status === 'PENDING' && (
                          <button
                            onClick={() => handleCancelOrderClick(order.id)}
                            className="bg-red-500/10 border border-red-500/30 hover:bg-red-500/25 text-red-600 py-1.5 px-3 rounded-lg text-xs font-semibold transition-colors flex items-center space-x-1 cursor-pointer"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                            <span>İptal Et</span>
                          </button>
                        )}
                      </div>
                    </div>

                    <div className="p-5 grid grid-cols-1 md:grid-cols-3 gap-6 items-start">
                      <div className="md:col-span-2 space-y-3">
                        <span className="text-slate-500 text-x font-bold uppercase tracking-wider block">Ürünler</span>
                        <div className="divide-y divide-slate-750">
                          {order.orderItems.map((item) => (
                            <div key={item.productId} className="flex justify-between py-2 text-sm text-slate-555">
                              <span className="font-semibold">{item.productName} <span className="text-slate-500 text-xs font-normal">×{item.quantity}</span></span>
                              <span className="font-bold text-slate-900">{(item.price * item.quantity).toLocaleString('tr-TR')} TL</span>
                            </div>
                          ))}
                        </div>
                      </div>

                      <div className="bg-slate-900 p-4 rounded-lg space-y-2 text-sm md:col-span-1">
                        <span className="text-indigo-600 text-s font-bold uppercase tracking-wider flex items-center space-x-1">
                          <MapPin className="w-3.5 h-3.5" />
                          <span>Teslimat Adresi</span>
                        </span>
                        <div className="text-slate-755 font-medium">
                          <p>{order.shippingAddress.street}</p>
                          <p>{order.shippingAddress.zipCode} {order.shippingAddress.city}/{order.shippingAddress.country}</p>
                        </div>
                        <div className="border-t border-slate-750 pt-2 mt-2 space-y-1">
                          <div className="flex justify-between text-xs text-slate-500">
                            <span>Ara Toplam</span>
                            <span className="font-semibold text-slate-900">{order.totalAmount.toLocaleString('tr-TR')} TL</span>
                          </div>
                          {order.couponCode && order.discountAmount && (
                            <div className="flex justify-between text-xs">
                              <span className="text-emerald-600 font-semibold flex items-center space-x-1">
                                <Tag className="w-3 h-3" />
                                <span>Kupon ({order.couponCode})</span>
                              </span>
                              <span className="text-emerald-600 font-bold">-{order.discountAmount.toLocaleString('tr-TR')} TL</span>
                            </div>
                          )}
                          <div className="flex justify-between text-xs font-bold border-t border-slate-750 pt-1">
                            <span className="text-slate-900">Toplam</span>
                            <span className="text-indigo-600">{(order.finalAmount ?? order.totalAmount).toLocaleString('tr-TR')} TL</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              <Pagination
                currentPage={currentPage}
                totalPages={totalPages}
                onPageChange={handlePageChange}
              />
            </div>
          )}
        </div>
      </div>

      {/* Cancel Order Confirmation Modal */}
      {cancelTargetOrderId && (
        <div className="fixed inset-0 z-50 overflow-hidden flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/60 backdrop-blur-xs" onClick={() => setCancelTargetOrderId(null)} />
          <div className="bg-slate-800 border border-slate-700 rounded-2xl max-w-md w-full p-6 text-center space-y-6 shadow-2xl relative z-10 animate-fade-in">
            <div className="flex justify-center">
              <div className="bg-red-500/10 border border-red-500/35 p-3 rounded-full text-red-500">
                <AlertCircle className="w-12 h-12" />
              </div>
            </div>
            <div className="space-y-2">
              <h3 className="text-lg font-bold text-slate-900">Siparişi İptal Et</h3>
              <p className="text-slate-500 text-xs leading-relaxed">
                Bu siparişi iptal etmek istediğinize emin misiniz? Bu işlem geri alınamaz.
              </p>
            </div>
            <div className="flex space-x-3 pt-2">
              <button
                onClick={() => setCancelTargetOrderId(null)}
                className="flex-1 bg-slate-100 hover:bg-slate-200 text-slate-800 font-semibold py-2.5 px-4 rounded-lg text-sm transition-colors cursor-pointer"
              >
                Vazgeç
              </button>
              <button
                onClick={handleConfirmCancel}
                disabled={isCancelling}
                className="flex-1 bg-red-650 hover:bg-red-600 disabled:bg-red-800 text-white font-semibold py-2.5 px-4 rounded-lg text-sm transition-colors flex items-center justify-center cursor-pointer"
              >
                {isCancelling ? (
                  <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                ) : (
                  <span>İptal Et</span>
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Address Add/Edit Modal */}
      {isAddressModalOpen && (
        <div className="fixed inset-0 z-50 overflow-y-auto flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/60 backdrop-blur-xs" onClick={() => setIsAddressModalOpen(false)} />
          <div className="bg-slate-800 border border-slate-700 rounded-2xl max-w-lg w-full p-6 shadow-2xl relative z-10 space-y-6">
            <div className="flex justify-between items-center">
              <h3 className="text-xl font-bold text-slate-900">
                {editingAddressIndex !== null ? 'Adresi Düzenle' : 'Yeni Adres Ekle'}
              </h3>
              <button
                onClick={() => setIsAddressModalOpen(false)}
                className="text-slate-400 hover:text-white cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-4 text-sm">
              {/* Label Selection */}
              <div>
                <label className="block text-slate-500 font-semibold mb-2">Adres Etiketi</label>
                <div className="flex gap-2">
                  {ADDRESS_LABELS.map((label) => (
                    <button
                      key={label}
                      type="button"
                      onClick={() => setAddressForm((prev) => ({ ...prev, label }))}
                      className={`flex items-center space-x-1.5 px-4 py-2 rounded-lg text-xs font-semibold transition-all cursor-pointer border ${
                        addressForm.label === label
                          ? 'bg-indigo-500/10 border-indigo-500/40 text-indigo-600'
                          : 'bg-slate-900 border-slate-700 text-slate-400 hover:text-slate-200'
                      }`}
                    >
                      {label === 'Ev' ? <Home className="w-3.5 h-3.5" /> : label === 'İş' ? <Briefcase className="w-3.5 h-3.5" /> : <Building2 className="w-3.5 h-3.5" />}
                      <span>{label}</span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Street */}
              <div>
                <label className="block text-slate-500 font-semibold mb-1.5">Açık Adres (Sokak, Apartman No, Daire)</label>
                <input
                  type="text"
                  value={addressForm.street}
                  onChange={(e) => setAddressForm((prev) => ({ ...prev, street: e.target.value }))}
                  placeholder="Atatürk Cad. No:12 Daire:4"
                  className="w-full bg-slate-900 border border-slate-700 rounded-lg py-2 px-3.5 text-slate-800 placeholder-slate-455 focus:outline-none focus:border-indigo-500 transition-colors"
                />
              </div>

              <div className="grid grid-cols-3 gap-3">
                {/* City */}
                <div>
                  <label className="block text-slate-500 font-semibold mb-1.5">Şehir</label>
                  <input
                    type="text"
                    value={addressForm.city}
                    onChange={(e) => setAddressForm((prev) => ({ ...prev, city: e.target.value }))}
                    placeholder="İstanbul"
                    className="w-full bg-slate-900 border border-slate-700 rounded-lg py-2 px-3.5 text-slate-800 placeholder-slate-455 focus:outline-none focus:border-indigo-500 transition-colors"
                  />
                </div>
                {/* Zip Code */}
                <div>
                  <label className="block text-slate-500 font-semibold mb-1.5">Posta Kodu</label>
                  <input
                    type="text"
                    value={addressForm.zipCode}
                    onChange={(e) => setAddressForm((prev) => ({ ...prev, zipCode: e.target.value }))}
                    placeholder="34000"
                    className="w-full bg-slate-900 border border-slate-700 rounded-lg py-2 px-3.5 text-slate-800 placeholder-slate-455 focus:outline-none focus:border-indigo-500 transition-colors"
                  />
                </div>
                {/* Country */}
                <div>
                  <label className="block text-slate-500 font-semibold mb-1.5">Ülke</label>
                  <input
                    type="text"
                    value={addressForm.country}
                    onChange={(e) => setAddressForm((prev) => ({ ...prev, country: e.target.value }))}
                    placeholder="Türkiye"
                    className="w-full bg-slate-900 border border-slate-700 rounded-lg py-2 px-3.5 text-slate-800 placeholder-slate-455 focus:outline-none focus:border-indigo-500 transition-colors"
                  />
                </div>
              </div>

              <div className="flex space-x-3 pt-4">
                <button
                  onClick={() => setIsAddressModalOpen(false)}
                  className="flex-1 bg-slate-100 hover:bg-slate-200 text-white font-semibold py-2.5 px-4 rounded-lg text-sm transition-colors cursor-pointer"
                >
                  Vazgeç
                </button>
                <button
                  onClick={handleAddressSave}
                  disabled={isAddressSaving}
                  className="flex-1 bg-indigo-600 hover:bg-indigo-500 disabled:bg-indigo-800 text-white font-semibold py-2.5 px-4 rounded-lg text-sm transition-colors flex items-center justify-center cursor-pointer"
                >
                  {isAddressSaving ? (
                    <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  ) : (
                    <span>{editingAddressIndex !== null ? 'Güncelle' : 'Ekle'}</span>
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Delete Address Confirmation Modal */}
      {deleteAddressIndex !== null && (
        <div className="fixed inset-0 z-50 overflow-hidden flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/60 backdrop-blur-xs" onClick={() => setDeleteAddressIndex(null)} />
          <div className="bg-slate-800 border border-slate-700 rounded-2xl max-w-md w-full p-6 text-center space-y-6 shadow-2xl relative z-10 animate-fade-in">
            <div className="flex justify-center">
              <div className="bg-red-500/10 border border-red-500/35 p-3 rounded-full text-red-500">
                <AlertCircle className="w-12 h-12" />
              </div>
            </div>
            <div className="space-y-2">
              <h3 className="text-lg font-bold text-slate-900">Adresi Sil</h3>
              <p className="text-slate-500 text-xs leading-relaxed">
                Bu adresi silmek istediğinize emin misiniz? Bu işlem geri alınamaz.
              </p>
            </div>
            <div className="flex space-x-3 pt-2">
              <button
                onClick={() => setDeleteAddressIndex(null)}
                className="flex-1 bg-slate-100 hover:bg-slate-200 text-slate-800 font-semibold py-2.5 px-4 rounded-lg text-sm transition-colors cursor-pointer"
              >
                Vazgeç
              </button>
              <button
                onClick={handleDeleteAddress}
                disabled={isAddressDeleting}
                className="flex-1 bg-red-650 hover:bg-red-600 disabled:bg-red-800 text-white font-semibold py-2.5 px-4 rounded-lg text-sm transition-colors flex items-center justify-center cursor-pointer"
              >
                {isAddressDeleting ? (
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