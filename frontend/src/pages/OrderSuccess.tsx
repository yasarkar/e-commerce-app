import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { orderService } from '../api/orderService';
import { CheckCircle, ShoppingBag, ArrowRight, Tag, Loader2 } from 'lucide-react';
import type { Order } from '../types';

export const OrderSuccess: React.FC = () => {
  const { orderId } = useParams<{ orderId: string }>();
  const [order, setOrder] = useState<Order | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);

  useEffect(() => {
    const fetchOrder = async () => {
      if (!orderId) return;
      setIsLoading(true);
      try {
        const response = await orderService.getOrderById(orderId);
        setOrder(response.data);
      } catch (error) {
        console.error('Error fetching order:', error);
        setLoadError('Sipariş detayı yüklenirken bir hata oluştu.');
      } finally {
        setIsLoading(false);
      }
    };
    fetchOrder();
  }, [orderId]);

  const hasCoupon = order?.couponCode && order?.discountAmount ? true : false;

  return (
    <div className="flex-grow bg-slate-955 text-slate-800 flex items-center justify-center p-6">
      <div className="max-w-md w-full bg-slate-800 border border-slate-700 rounded-2xl p-8 text-center shadow-xl space-y-6">
        <div className="flex justify-center">
          <div className="bg-emerald-500/10 border border-emerald-500/20 p-4 rounded-full text-emerald-600">
            <CheckCircle className="w-16 h-16" />
          </div>
        </div>

        <div className="space-y-2">
          <h2 className="text-2xl font-bold text-slate-900">Siparişiniz Alındı!</h2>
          <p className="text-slate-500 text-sm">
            Bizi tercih ettiğiniz için teşekkür ederiz. Siparişiniz başarıyla oluşturulmuştur.
          </p>
        </div>

        {orderId && (
          <div className="bg-slate-900 border border-slate-750 p-4 rounded-lg space-y-1">
            <span className="text-slate-500 text-xs font-semibold uppercase tracking-wider block">Sipariş Numarası</span>
            <span className="font-mono text-indigo-600 font-extrabold text-sm select-all">{orderId}</span>
          </div>
        )}

        {isLoading && (
          <div className="flex items-center justify-center space-x-2 text-slate-400 text-sm py-2">
            <Loader2 className="w-4 h-4 animate-spin" />
            <span>Sipariş detayı yükleniyor...</span>
          </div>
        )}

        {loadError && (
          <div className="bg-red-500/10 border border-red-500/40 rounded-lg p-3 text-red-600 text-sm">
            {loadError}
          </div>
        )}

        {order && !isLoading && (
          <div className="bg-slate-900 border border-slate-750 rounded-lg p-4 space-y-2 text-sm">
            <div className="flex justify-between text-slate-500">
              <span>Ara Toplam</span>
              <span className="font-semibold text-slate-900">{order.totalAmount.toLocaleString('tr-TR')} TL</span>
            </div>
            {hasCoupon && order.couponCode && (
              <div className="flex justify-between">
                <span className="text-emerald-600 font-semibold flex items-center space-x-1">
                  <Tag className="w-3.5 h-3.5" />
                  <span>Kupon ({order.couponCode})</span>
                </span>
                <span className="text-emerald-600 font-bold">
                  -{order.discountAmount?.toLocaleString('tr-TR')} TL
                </span>
              </div>
            )}
            <div className="flex justify-between items-baseline pt-1 border-t border-slate-750">
              <span className="font-bold text-slate-900">Toplam Tutar</span>
              <span className="font-black text-lg text-indigo-600">
                {(order.finalAmount ?? order.totalAmount).toLocaleString('tr-TR')} TL
              </span>
            </div>
          </div>
        )}

        <div className="flex flex-col sm:flex-row gap-3 pt-2">
          <Link
            to="/profile"
            className="flex-grow bg-slate-100 hover:bg-slate-200 text-white font-semibold py-2.5 px-4 rounded-lg text-sm transition-colors flex items-center justify-center space-x-1.5 cursor-pointer"
          >
            <ShoppingBag className="w-4 h-4" />
            <span>Siparişlerime Git</span>
          </Link>
          <Link
            to="/"
            className="flex-grow bg-indigo-500 hover:bg-indigo-600 text-white font-semibold py-2.5 px-4 rounded-lg text-sm transition-colors flex items-center justify-center space-x-1.5 cursor-pointer shadow-lg shadow-indigo-500/20"
          >
            <span>Alışverişe Devam Et</span>
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </div>
    </div>
  );
};