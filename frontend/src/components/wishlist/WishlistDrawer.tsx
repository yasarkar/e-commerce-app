import React, { useState } from 'react';
import { useWishlist } from '../../context/WishlistContext';
import { useCart } from '../../context/CartContext';
import { X, Trash2, Heart, ShoppingCart, Check } from 'lucide-react';

export const WishlistDrawer: React.FC = () => {
  const {
    wishlist,
    itemCount,
    isWishlistOpen,
    closeWishlist,
    removeFromWishlist,
    clearWishlist,
    isLoading,
  } = useWishlist();
  const { addToCart } = useCart();
  const [addedProductId, setAddedProductId] = useState<string | null>(null);

  const handleAddToCart = async (productId: string) => {
    if (addedProductId === productId) return;
    setAddedProductId(productId);
    try {
      // openDrawer=false: Sepet drawer'ı açılmaz, kullanıcı favorilerde kalır
      await addToCart(productId, 1, false);
    } catch (error) {
      setAddedProductId(null);
      return;
    }
    setTimeout(() => setAddedProductId(null), 1500);
  };

  return (
    <div
      className={`fixed inset-0 z-50 overflow-hidden transition-all duration-300 ${isWishlistOpen ? 'visible' : 'invisible'}`}
    >
      <div
        className={`absolute inset-0 bg-black/60 backdrop-blur-xs transition-opacity duration-300 ${isWishlistOpen ? 'opacity-100' : 'opacity-0'
          }`}
        onClick={closeWishlist}
      />

      <div className="absolute inset-y-0 right-0 max-w-full flex pl-10">
        <div
          className={`w-screen max-w-md bg-slate-900 border-l border-slate-700 text-slate-800 flex flex-col h-full shadow-2xl relative transform transition-transform duration-300 ease-in-out ${isWishlistOpen ? 'translate-x-0' : 'translate-x-full'
            }`}
        >

          <div className="p-6 border-b border-slate-700 flex items-center justify-between">
            <div className="flex items-center space-x-2.5">
              <Heart className="w-6 h-6 text-rose-500" />
              <h2 className="text-lg font-bold text-slate-900 font-bold">Favorilerim</h2>
              <span className="bg-rose-500/10 text-rose-600 text-xs px-2.5 py-0.5 rounded-full font-bold">
                {itemCount} Ürün
              </span>
            </div>
            <button
              onClick={closeWishlist}
              className="p-1 text-slate-400 hover:text-slate-900 rounded-lg transition-colors cursor-pointer"
            >
              <X className="w-6 h-6" />
            </button>
          </div>

          <div className="flex-1 overflow-y-auto p-6 space-y-6">
            {isLoading && (
              <div className="absolute inset-0 bg-slate-950/40 flex items-center justify-center z-10">
                <div className="w-8 h-8 border-3 border-rose-500 border-t-transparent rounded-full animate-spin"></div>
              </div>
            )}

            {!wishlist || wishlist.items.length === 0 ? (
              <div className="h-full flex flex-col items-center justify-center text-center space-y-4">
                <div className="bg-slate-50 p-4 rounded-full text-slate-400 border border-slate-200">
                  <Heart className="w-12 h-12" />
                </div>
                <h3 className="text-lg font-bold text-slate-700">Favorileriniz Boş</h3>
                <p className="text-slate-500 text-xs max-w-[250px]">
                  Favorilerinizde henüz ürün bulunmuyor. Beğendiğiniz ürünlerin kalp ikonuna tıklayarak ekleyebilirsiniz.
                </p>
                <button
                  onClick={closeWishlist}
                  className="bg-rose-500 hover:bg-rose-400 text-white font-semibold text-sm py-2 px-6 rounded-lg transition-colors cursor-pointer"
                >
                  Alışverişe Başla
                </button>
              </div>
            ) : (
              <div className="divide-y divide-slate-750 space-y-4">
                {wishlist.items.map((item) => {
                  const isOutOfStock = item.stockQuantity <= 0;
                  return (
                    <div
                      key={item.productId}
                      className="flex py-4 first:pt-0 last:pb-0 items-start justify-between space-x-4"
                    >
                      <div className="flex-1 space-y-1">
                        <h4 className="font-semibold text-slate-900 text-sm line-clamp-1">{item.productName}</h4>
                        <p className="text-rose-500 text-xs font-bold">
                          {item.price.toLocaleString('tr-TR', { style: 'currency', currency: 'TRY' })}
                        </p>
                        <div className="pt-1">
                          {isOutOfStock ? (
                            <span className="text-[10px] font-bold text-red-600 bg-red-50 border border-red-200 px-2 py-0.5 rounded-md">
                              Stokta Yok
                            </span>
                          ) : (
                            <span className="text-[10px] font-bold text-emerald-600 bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded-md">
                              {item.stockQuantity} adet stokta
                            </span>
                          )}
                        </div>
                      </div>

                      <div className="flex flex-col items-end justify-between h-20">
                        <button
                          onClick={() => removeFromWishlist(item.productId)}
                          className="text-slate-400 hover:text-red-500 transition-colors cursor-pointer p-1"
                          title="Favorilerden Çıkar"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleAddToCart(item.productId)}
                          disabled={isOutOfStock}
                          className={`border text-xs font-bold py-1.5 px-3 rounded-md transition-all active:scale-[0.98] flex items-center space-x-1.5 cursor-pointer disabled:cursor-not-allowed whitespace-nowrap ${
                            addedProductId === item.productId
                              ? 'bg-emerald-500 hover:bg-emerald-400 border-emerald-400 text-white'
                              : 'bg-indigo-600 hover:bg-indigo-500 disabled:bg-slate-200 disabled:text-slate-400 border border-indigo-400 text-white'
                          }`}
                          title={isOutOfStock ? 'Stokta yok' : addedProductId === item.productId ? 'Sepete eklendi' : 'Sepete Ekle'}
                        >
                          {addedProductId === item.productId ? (
                            <>
                              <Check className="w-3.5 h-3.5" />
                              <span>Sepete Eklendi</span>
                            </>
                          ) : (
                            <>
                              <ShoppingCart className="w-3.5 h-3.5" />
                              <span>Sepete Ekle</span>
                            </>
                          )}
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {wishlist && wishlist.items.length > 0 && (
            <div className="p-6 border-t border-slate-700 bg-slate-850 space-y-4">
              <button
                onClick={clearWishlist}
                className="w-full bg-red-650 hover:bg-red-50 disabled:bg-red-800 text-red-600 font-semibold py-2 px-3 border border-red-700 rounded-lg transition-all active:scale-[0.98] flex items-center justify-center cursor-pointer text-sm"
              >
                Tümünü Temizle
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};