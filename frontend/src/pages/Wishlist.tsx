import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useWishlist } from '../context/WishlistContext';
import { useCart } from '../context/CartContext';
import { Heart, ShoppingCart, Trash2, ArrowLeft, Check } from 'lucide-react';

export const Wishlist: React.FC = () => {
  const {
    wishlist,
    isLoading,
    removeFromWishlist,
    clearWishlist,
  } = useWishlist();
  const { addToCart } = useCart();
  const [addedProductId, setAddedProductId] = useState<string | null>(null);

  const handleAddToCart = async (productId: string) => {
    if (addedProductId === productId) return;
    setAddedProductId(productId);
    try {
      // openDrawer=false: Sepet drawer'ı açılmaz, kullanıcı Favorilerim sayfasında kalır
      await addToCart(productId, 1, false);
    } catch (error) {
      setAddedProductId(null);
      return;
    }
    setTimeout(() => setAddedProductId(null), 1500);
  };

  if (isLoading) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center py-20 bg-slate-50 text-slate-800">
        <div className="w-12 h-12 border-4 border-rose-500 border-t-transparent rounded-full animate-spin"></div>
        <p className="text-slate-500 mt-4 font-medium">Favoriler Yükleniyor...</p>
      </div>
    );
  }

  const items = wishlist?.items || [];

  return (
    <div className="bg-slate-50 text-slate-800 flex-1">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex items-center justify-between mb-8">
          <div>
            <Link
              to="/"
              className="inline-flex items-center space-x-2 text-slate-500 hover:text-indigo-600 mb-4 transition-colors cursor-pointer font-medium text-sm"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>Kataloğa Dön</span>
            </Link>
            <div className="flex items-center space-x-3">
              <Heart className="w-7 h-7 text-rose-500 fill-current" />
              <h1 className="text-3xl font-extrabold tracking-tight text-slate-900">Favorilerim</h1>
              {items.length > 0 && (
                <span className="bg-rose-50 text-rose-600 text-xs px-2.5 py-1 rounded-full font-bold border border-rose-200">
                  {items.length} Ürün
                </span>
              )}
            </div>
          </div>

          {items.length > 0 && (
            <button
              onClick={clearWishlist}
              className="flex items-center space-x-2 text-sm font-semibold text-slate-600 hover:text-red-600 transition-colors cursor-pointer"
            >
              <Trash2 className="w-4 h-4" />
              <span>Tümünü Temizle</span>
            </button>
          )}
        </div>

        {items.length === 0 ? (
          <div className="bg-white border border-slate-200 rounded-2xl p-16 text-center shadow-sm">
            <div className="bg-rose-50 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
              <Heart className="w-8 h-8 text-rose-400" />
            </div>
            <h2 className="text-xl font-bold text-slate-900 mb-2">Favorileriniz Boş</h2>
            <p className="text-slate-500 text-sm mb-6 max-w-sm mx-auto">
              Beğendiğiniz ürünleri favorilerinize ekleyerek burada toplayabilirsiniz. Ürün kartlarındaki kalp ikonuna tıklamanız yeterli.
            </p>
            <Link
              to="/"
              className="inline-flex items-center space-x-2 bg-rose-500 hover:bg-rose-400 text-white font-semibold py-2.5 px-6 rounded-lg transition-colors cursor-pointer"
            >
              <ShoppingCart className="w-4 h-4" />
              <span>Alışverişe Başla</span>
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {items.map((item) => {
              const isOutOfStock = item.stockQuantity <= 0;
              return (
                <div
                  key={item.productId}
                  className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden flex flex-col h-full hover:shadow-md transition-shadow"
                >
                  <div className="aspect-square bg-slate-100 relative flex items-center justify-center">
                    <ShoppingCart className="w-12 h-12 text-slate-300" />
                    {!item.active && (
                      <span className="absolute top-3 left-3 bg-amber-50 border border-amber-200 text-amber-600 text-[10px] px-2 py-0.5 rounded-md font-semibold">
                        Pasif Ürün
                      </span>
                    )}
                    {isOutOfStock && (
                      <span className="absolute top-3 left-3 bg-red-50 border border-red-200 text-red-600 text-[10px] px-2 py-0.5 rounded-md font-semibold">
                        Stokta Yok
                      </span>
                    )}
                  </div>

                  <div className="p-4 flex-1 flex flex-col justify-between">
                    <div>
                      <Link
                        to={`/products/${item.productId}`}
                        className="text-slate-900 font-bold hover:text-indigo-600 transition-colors text-sm line-clamp-1"
                      >
                        {item.productName}
                      </Link>
                      <p className="mt-2 text-rose-600 font-extrabold text-base">
                        {item.price.toLocaleString('tr-TR', { style: 'currency', currency: 'TRY' })}
                      </p>
                    </div>

                    <div className="mt-4 pt-4 border-t border-slate-100 flex gap-2">
                      <button
                        onClick={() => handleAddToCart(item.productId)}
                        disabled={isOutOfStock || !item.active}
                        className={`flex-1 font-semibold text-xs py-2 px-3 rounded-lg transition-all flex items-center justify-center space-x-1.5 cursor-pointer disabled:cursor-not-allowed ${
                          addedProductId === item.productId
                            ? 'bg-emerald-500 hover:bg-emerald-400 text-white'
                            : 'bg-indigo-600 hover:bg-indigo-500 disabled:bg-slate-100 disabled:text-slate-400 text-white'
                        }`}
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
                      <button
                        onClick={() => removeFromWishlist(item.productId)}
                        className="bg-rose-50 hover:bg-rose-100 text-rose-600 font-semibold text-xs py-2 px-3 rounded-lg transition-colors flex items-center justify-center cursor-pointer border border-rose-200"
                        title="Favorilerden Çıkar"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};