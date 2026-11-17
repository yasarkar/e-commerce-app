import React, { useState, useEffect } from 'react';
import { adminOrderService } from '../../api/adminOrderService';
import { useToast } from '../../context/ToastContext';
import type { Order, OrderStatus } from '../../types';
import { Pagination } from '../../components/common/Pagination';
import { ClipboardList, Calendar, MapPin, Eye, Trash2, AlertCircle, RefreshCw, X } from 'lucide-react';

export const AdminOrders: React.FC = () => {
  const { showToast } = useToast();
  const [orders, setOrders] = useState<Order[]>([]);
  const [currentPage, setCurrentPage] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [isLoading, setIsLoading] = useState(true);

  // Detail Modal
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);

  // Deletion Modal
  const [deletingOrderId, setDeletingOrderId] = useState<string | null>(null);
  const [isActionPending, setIsActionPending] = useState(false);

  const fetchOrders = async (page = 0) => {
    setIsLoading(true);
    try {
      const response = await adminOrderService.getAllOrders(page, 8);
      setOrders(response.data.content);
      setTotalPages(response.data.totalPages);
      setCurrentPage(response.data.number);
    } catch (error) {
      console.error('Error fetching admin orders:', error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchOrders(0);
  }, []);

  const handlePageChange = (page: number) => {
    fetchOrders(page);
  };

  const handleStatusChange = async (orderId: string, newStatus: OrderStatus) => {
    try {
      await adminOrderService.updateOrderStatus(orderId, newStatus);
      fetchOrders(currentPage);
      showToast('success', 'Sipariş durumu başarıyla güncellendi');
    } catch (error) {
      console.error('Error updating order status:', error);
      showToast('error', 'Sipariş durumu güncellenirken hata oluştu');
    }
  };

  const handleDeleteConfirm = async () => {
    if (!deletingOrderId) return;
    setIsActionPending(true);
    try {
      await adminOrderService.deleteOrder(deletingOrderId);
      setDeletingOrderId(null);
      fetchOrders(currentPage);
      showToast('warning', 'Sipariş silindi');
    } catch (error) {
      console.error('Error deleting order:', error);
      showToast('error', 'Sipariş silinirken hata oluştu');
    } finally {
      setIsActionPending(false);
    }
  };

  const getStatusColor = (status: OrderStatus) => {
    const styles = {
      PENDING: 'bg-amber-500/10 border-amber-500/30 text-amber-400',
      PROCESSING: 'bg-blue-500/10 border-blue-500/30 text-blue-400',
      SHIPPED: 'bg-purple-500/10 border-purple-500/30 text-purple-400',
      DELIVERED: 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400',
      CANCELLED: 'bg-red-500/10 border-red-500/30 text-red-400',
    };
    return styles[status] || 'bg-slate-800 border-slate-700 text-slate-300';
  };

  return (
    <div className="space-y-8 animate-fade-in">
      <div>
        <h1 className="text-3xl font-extrabold text-black tracking-tight">Sipariş Yönetimi</h1>
        <p className="text-slate-400 text-sm mt-1">Sistemdeki tüm siparişleri izleyin, durumlarını güncelleyin ve iptal edin.</p>
      </div>

      {isLoading ? (
        <div className="flex flex-col items-center justify-center py-20 bg-slate-900/30 rounded-2xl border border-slate-855">
          <RefreshCw className="w-10 h-10 text-indigo-600 animate-spin" />
          <p className="text-slate-400 text-sm font-semibold mt-4">Siparişler Yükleniyor...</p>
        </div>
      ) : orders.length === 0 ? (
        <div className="bg-slate-900/30 border border-slate-800 rounded-2xl p-16 text-center">
          <ClipboardList className="w-12 h-12 text-slate-600 mx-auto mb-4" />
          <p className="text-slate-400 text-sm font-medium">Henüz bir sipariş kaydı bulunmuyor.</p>
        </div>
      ) : (
        <div className="space-y-6">
          <div className="bg-slate-900 border border-slate-800 rounded-xl overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-slate-850 text-slate-400 text-xs uppercase font-bold border-b border-slate-800">
                    <th className="py-4 px-6">Sipariş ID / Tarih</th>
                    <th className="py-4 px-6">Müşteri  ID</th>
                    <th className="py-4 px-6 text-right">Toplam Tutar</th>
                    <th className="py-4 px-6 text-center">Sipariş Durumu</th>
                    <th className="py-4 px-6 text-center w-48">Durum Güncelle</th>
                    <th className="py-4 px-6 text-center">İşlemler</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800 text-sm">
                  {orders.map((order) => (
                    <tr key={order.id} className="border border-slate-800 hover:bg-slate-850/50 transition-colors">
                      <td className="py-4 px-6">
                        <p className="font-mono text-black text-xs">{order.id}</p>
                        <p className="text-slate-500 text-xs mt-1 flex items-center space-x-1">
                          <Calendar className="w-3.5 h-3.5" />
                          <span>{new Date(order.orderDate).toLocaleDateString('tr-TR')}</span>
                        </p>
                      </td>
                      <td className="py-4 px-6 text-slate-300 font-mono text-xs">
                        {order.userId}
                      </td>
                      <td className="py-4 px-6 text-right font-bold text-black">
                        {order.totalAmount.toLocaleString('tr-TR')} TL
                      </td>
                      <td className="py-4 px-6 text-center">
                        <span className={`inline-flex items-center border px-2.5 py-0.5 rounded-full text-xs font-semibold tracking-wide ${getStatusColor(order.status)}`}>
                          {order.status}
                        </span>
                      </td>
                      <td className="py-4 px-6">
                        <select
                          value={order.status}
                          onChange={(e) => handleStatusChange(order.id, e.target.value as OrderStatus)}
                          className="w-full bg-slate-955 border border-slate-800 text-slate-300 rounded-lg py-1.5 px-3 text-xs focus:outline-none focus:border-indigo-600 transition-colors cursor-pointer"
                        >
                          <option value="PENDING">Bekleyen</option>
                          <option value="PROCESSING">İşleniyor</option>
                          <option value="SHIPPED">Kargolandı</option>
                          <option value="DELIVERED">Teslim Edildi</option>
                          <option value="CANCELLED">İptal Edildi</option>
                        </select>
                      </td>
                      <td className="py-4 px-6">
                        <div className="flex items-center justify-center space-x-2.5">
                          <button
                            onClick={() => setSelectedOrder(order)}
                            className="p-1.5 bg-slate-800 hover:bg-slate-700 border border-slate-750 text-indigo-400 hover:text-indigo-305 rounded-lg transition-colors cursor-pointer"
                            title="Detayları Gör"
                          >
                            <Eye className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => setDeletingOrderId(order.id)}
                            className="p-1.5 bg-slate-800 hover:bg-slate-700 border border-slate-750 text-red-500 hover:text-red-450 rounded-lg transition-colors cursor-pointer"
                            title="Siparişi Sil"
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

      {selectedOrder && (
        <div className="fixed inset-0 z-50 overflow-y-auto flex items-center justify-center p-4 animate-fade-in">
          <div className="absolute inset-0 bg-black/60 backdrop-blur-xs" onClick={() => setSelectedOrder(null)} />
          <div className="bg-slate-900 border border-slate-800 rounded-2xl max-w-2xl w-full p-6 shadow-2xl relative z-10 space-y-6 text-sm">
            <div className="flex justify-between items-center border-b border-slate-800 pb-4">
              <div>
                <h3 className="text-lg font-bold text-black">Sipariş Detayı</h3>
                <p className="text-slate-500 font-mono text-xs mt-1">ID: {selectedOrder.id}</p>
              </div>
              <button
                onClick={() => setSelectedOrder(null)}
                className="text-slate-400 hover:text-white cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-3">
                <span className="text-slate-400 text-xs font-bold uppercase tracking-wider block">Ürünler</span>
                <div className="divide-y divide-slate-805 max-h-60 overflow-y-auto pr-1">
                  {selectedOrder.orderItems.map((item) => (
                    <div key={item.productId} className="flex justify-between py-2.5 text-xs text-slate-300">
                      <div>
                        <p className="font-semibold text-black">{item.productName}</p>
                        <p className="text-slate-500 text-[10px] mt-0.5">{item.quantity} Adet × {item.price.toLocaleString('tr-TR')} TL</p>
                      </div>
                      <span className="font-bold text-black">{(item.price * item.quantity).toLocaleString('tr-TR')} TL</span>
                    </div>
                  ))}
                </div>
                <div className="border-t border-slate-800 pt-3 flex justify-between items-baseline">
                  <span className="font-semibold text-slate-400">Genel Toplam</span>
                  <span className="font-black text-lg text-indigo-400">{selectedOrder.totalAmount.toLocaleString('tr-TR')} TL</span>
                </div>
              </div>

              <div className="bg-slate-950/40 border border-slate-850 p-4 rounded-xl space-y-3">
                <span className="text-slate-400 text-xs font-bold uppercase tracking-wider flex items-center space-x-1.5">
                  <MapPin className="w-4 h-4 text-indigo-400" />
                  <span>Teslimat Adresi</span>
                </span>
                <div className="text-slate-300 font-medium space-y-1">
                  <p className="text-xs leading-relaxed">{selectedOrder.shippingAddress.street}</p>
                  <div className="grid grid-cols-2 gap-2 pt-2 text-xs">
                    <div>
                      <p className="text-slate-500">Şehir:</p>
                      <p className="text-black">{selectedOrder.shippingAddress.city}</p>
                    </div>
                    <div>
                      <p className="text-slate-500">Posta Kodu:</p>
                      <p className="text-black">{selectedOrder.shippingAddress.zipCode}</p>
                    </div>
                  </div>
                  <div className="pt-2 text-xs">
                    <p className="text-slate-500">Ülke:</p>
                    <p className="text-black uppercase">{selectedOrder.shippingAddress.country}</p>
                  </div>
                </div>
              </div>
            </div>

            <div className="flex justify-end pt-4 border-t border-slate-800">
              <button
                onClick={() => setSelectedOrder(null)}
                className="bg-indigo-600 hover:bg-indigo-500 text-white font-semibold py-2 px-6 rounded-lg transition-colors cursor-pointer"
              >
                Kapat
              </button>
            </div>
          </div>
        </div>
      )}

      {deletingOrderId && (
        <div className="fixed inset-0 z-50 overflow-hidden flex items-center justify-center p-4">
                  <div className="absolute inset-0 bg-black/60 backdrop-blur-xs" onClick={() => setDeletingOrderId(null)} />
                  <div className="bg-slate-900 border border-slate-800 rounded-2xl max-w-md w-full p-6 text-center space-y-6 shadow-2xl relative z-10 animate-fade-in">
                    <div className="flex justify-center">
                      <div className="bg-red-500/10 border border-red-500/35 p-3 rounded-full text-red-400">
                        <AlertCircle className="w-12 h-12" />
                      </div>
                    </div>
                    <div className="space-y-2">
              <h3 className="text-lg font-bold text-black">Siparişi İptal Et</h3>
              <p className="text-slate-400 text-xs leading-relaxed">
                Bu siparişi silmek istediğinize emin misiniz? Bu işlem geri alınamaz ve tüm kayıtlar tamamen silinecektir.
              </p>
            </div>
            <div className="flex space-x-3 pt-2">
              <button
                onClick={() => setDeletingOrderId(null)}
                className="flex-1 bg-white hover:bg-indigo-50 border border-indigo-600 text-indigo-600 font-semibold py-2.5 px-4 rounded-lg transition-all active:scale-[0.98] cursor-pointer text-sm"
              >
                Vazgeç
              </button>
              <button
                onClick={handleDeleteConfirm}
                disabled={isActionPending}
                className="flex-1 bg-red-650 hover:bg-red-50 disabled:bg-red-800 text-red-600 font-semibold py-2.5 px-4 border border-red-700 rounded-lg transition-all active:scale-[0.98] flex items-center justify-center cursor-pointer text-sm"
              >
                {isActionPending ? (
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
