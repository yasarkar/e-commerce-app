import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useCart } from '../../context/CartContext';
import { X, Trash2, Plus, Minus, ShoppingBag, ArrowRight } from 'lucide-react';

export const CartDrawer: React.FC = () => {
  const {
    cart,
    itemCount,
    isCartOpen,
    closeCart,
    updateQuantity,
    removeFromCart,
    clear,
    isLoading,
  } = useCart();
  const navigate = useNavigate();

  const handleCheckoutClick = () => {
    closeCart();
    navigate('/checkout');
  };

  return (
    <div className={`fixed inset-0 z-50 overflow-hidden transition-all duration-300 ${isCartOpen ? 'visible' : 'invisible'}`}>
      <div
        className={`absolute inset-0 bg-black/60 backdrop-blur-xs transition-opacity duration-300 ${isCartOpen ? 'opacity-100' : 'opacity-0'
          }`}
        onClick={closeCart}
      />

      <div className="absolute inset-y-0 right-0 max-w-full flex pl-10">
        <div
          className={`w-screen max-w-md bg-slate-900 border-l border-slate-700 text-slate-800 flex flex-col h-full shadow-2xl relative transform transition-transform duration-300 ease-in-out ${isCartOpen ? 'translate-x-0' : 'translate-x-full'
            }`}
        >

          <div className="p-6 border-b border-slate-700 flex items-center justify-between">
            <div className="flex items-center space-x-2.5">
              <ShoppingBag className="w-6 h-6 text-indigo-650" />
              <h2 className="text-lg font-bold text-slate-900 font-bold">Sepetim</h2>
              <span className="bg-indigo-500/10 text-indigo-655 text-xs px-2.5 py-0.5 rounded-full font-bold">
                {itemCount} Ürün
              </span>
            </div>
            <button
              onClick={closeCart}
              className="p-1 text-slate-400 hover:text-slate-900 rounded-lg transition-colors cursor-pointer"
            >
              <X className="w-6 h-6" />
            </button>
          </div>

          <div className="flex-1 overflow-y-auto p-6 space-y-6">
            {isLoading && (
              <div className="absolute inset-0 bg-slate-950/40 flex items-center justify-center z-10">
                <div className="w-8 h-8 border-3 border-indigo-650 border-t-transparent rounded-full animate-spin"></div>
              </div>
            )}

            {!cart || cart.items.length === 0 ? (
              <div className="h-full flex flex-col items-center justify-center text-center space-y-4">
                <div className="bg-slate-50 p-4 rounded-full text-slate-400 border border-slate-200">
                  <ShoppingBag className="w-12 h-12" />
                </div>
                <h3 className="text-lg font-bold text-slate-700">Sepetiniz Boş</h3>
                <p className="text-slate-500 text-xs max-w-[250px]">
                  Sepetinizde henüz ürün bulunmuyor. Kataloğu inceleyerek eklemeye başlayabilirsiniz.
                </p>
                <button
                  onClick={closeCart}
                  className="bg-indigo-600 hover:bg-indigo-500 text-white font-semibold text-sm py-2 px-6 rounded-lg transition-colors cursor-pointer"
                >
                  Alışverişe Başla
                </button>
              </div>
            ) : (
              <div className="divide-y divide-slate-750 space-y-4">
                {cart.items.map((item) => (
                  <div key={item.productId} className="flex py-4 first:pt-0 last:pb-0 items-start justify-between space-x-4">
                    <div className="flex-1 space-y-1">
                      <h4 className="font-semibold text-slate-900 text-sm line-clamp-1">{item.productName}</h4>
                      <p className="text-indigo-600 text-xs font-bold">
                        {item.price.toLocaleString('tr-TR', { style: 'currency', currency: 'TRY' })}
                      </p>
                      <div className="flex items-center space-x-2 pt-2">
                        <div className="flex items-center bg-slate-950 border border-slate-750 rounded-md overflow-hidden">
                          <button
                            onClick={() => updateQuantity(item.productId, item.quantity - 1)}
                            className="p-1 hover:bg-slate-100 transition-colors text-slate-400 hover:text-indigo-600 cursor-pointer"
                          >
                            <Minus className="w-3.5 h-3.5" />
                          </button>
                          <span className="px-2.5 text-xs text-slate-800 font-bold">{item.quantity}</span>
                          <button
                            onClick={() => updateQuantity(item.productId, item.quantity + 1)}
                            className="p-1 hover:bg-slate-100 transition-colors text-slate-400 hover:text-indigo-600 cursor-pointer"
                          >
                            <Plus className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>
                    </div>

                    <div className="flex flex-col items-end justify-between h-20">
                      <button
                        onClick={() => removeFromCart(item.productId)}
                        className="text-slate-400 hover:text-red-500 transition-colors cursor-pointer p-1"
                        title="Ürünü Sil"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => {
                          closeCart();
                          navigate(`/products/${item.productId}`);
                        }}
                        className="bg-blue-600 hover:bg-blue-500 border border-blue-400 text-white text-xs font-bold py-1.5 px-3 rounded-md transition-all active:scale-[0.98] flex items-center space-x-1.5 cursor-pointer whitespace-nowrap"
                        title="Ürün Sayfasına git"
                      >
                        <span>Ürün Sayfasına git</span>
                        <ArrowRight className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {cart && cart.items.length > 0 && (
            <div className="p-6 border-t border-slate-700 bg-slate-850 space-y-4">
              <div className="flex justify-between items-baseline">
                <span className="text-slate-500 text-sm font-semibold">Toplam Tutar:</span>
                <span className="text-2xl font-black text-indigo-600">
                  {cart.totalAmount.toLocaleString('tr-TR', { style: 'currency', currency: 'TRY' })}
                </span>
              </div>

              <div className="flex space-x-3 pt-2">
                <button
                  onClick={clear}
                  className="flex-1 bg-red-650 hover:bg-red-50 disabled:bg-red-800 text-red-600 font-semibold py-2 px-3 border border-red-700 rounded-lg transition-all active:scale-[0.98] flex items-center justify-center cursor-pointer text-sm"
                >
                  Sepeti Temizle
                </button>
                <button
                  onClick={handleCheckoutClick}
                  className="flex-1 bg-white hover:bg-indigo-50 border border-indigo-600 text-indigo-600 font-semibold py-2 px-3 rounded-lg transition-all active:scale-[0.98] cursor-pointer text-sm"
                >
                  <span>Siparişi Tamamla</span>
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
