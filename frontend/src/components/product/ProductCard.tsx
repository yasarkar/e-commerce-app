import React from 'react';
import { Link } from 'react-router-dom';
import type { Product } from '../../types';
import { ShoppingCart, Heart } from 'lucide-react';
import { useCart } from '../../context/CartContext';
import { useWishlist } from '../../context/WishlistContext';

interface ProductCardProps {
  product: Product;
  categoryName?: string;
}

export const ProductCard: React.FC<ProductCardProps> = ({ product, categoryName }) => {
  const { addToCart } = useCart();
  const { isInWishlist, addToWishlist, removeFromWishlist } = useWishlist();
  const isOutOfStock = product.stockQuantity <= 0;
  const inWishlist = isInWishlist(product.id);

  const handleAddToCart = (e: React.MouseEvent) => {
    e.preventDefault();
    addToCart(product.id);
  };

  const handleToggleWishlist = (e: React.MouseEvent) => {
    e.preventDefault();
    if (inWishlist) {
      removeFromWishlist(product.id);
    } else {
      addToWishlist(product.id);
    }
  };

  return (
    <Link
      to={`/products/${product.id}`}
      className="group bg-slate-800 rounded-xl overflow-hidden border border-slate-700 hover:border-indigo-500/50 hover:shadow-lg hover:shadow-indigo-500/5 transition-all flex flex-col h-full"
    >
      <div className="aspect-square bg-slate-900 flex items-center justify-center text-slate-400 relative overflow-hidden">
        <ShoppingCart className="w-12 h-12 group-hover:scale-110 transition-transform text-slate-300" />
        <button
          onClick={handleToggleWishlist}
          className={`absolute top-2.5 right-2.5 p-2 rounded-full transition-all cursor-pointer shadow-md ${
            inWishlist
              ? 'bg-rose-500 text-white hover:bg-rose-400 scale-110'
              : 'bg-white/90 text-slate-400 hover:text-rose-500 hover:scale-110'
          }`}
          title={inWishlist ? 'Favorilerden Çıkar' : 'Favorilere Ekle'}
        >
          <Heart className={`w-5 h-5 ${inWishlist ? 'fill-current' : ''}`} />
        </button>
      </div>

      <div className="p-5 flex-1 flex flex-col justify-between">
        <div>
          {categoryName && (
            <span className="text-xs text-indigo-600 font-semibold tracking-wide uppercase">
              {categoryName}
            </span>
          )}
          <h3 className="text-slate-900 font-bold group-hover:text-indigo-600 transition-colors mt-1 text-base line-clamp-1">
            {product.name}
          </h3>
          <p className="text-slate-500 text-xs mt-1 line-clamp-2">
            {product.description}
          </p>
        </div>

        <div className="mt-4 pt-4 border-t border-slate-700/50 flex items-center justify-between">
          <div>
            <span className="text-slate-950 text-xs block font-semibold">Fiyat</span>
            <span className="text-slate-950 font-extrabold text-lg">
              {product.price.toLocaleString('tr-TR', { style: 'currency', currency: 'TRY' })}
            </span>
          </div>

          <button
            onClick={handleAddToCart}
            disabled={isOutOfStock}
            className="bg-indigo-600 hover:bg-indigo-500 disabled:bg-slate-200 disabled:text-slate-400 text-white p-2.5 rounded-lg transition-colors flex items-center justify-center cursor-pointer disabled:cursor-not-allowed"
            title={isOutOfStock ? 'Stokta yok' : 'Sepete Ekle'}
          >
            <ShoppingCart className="w-5 h-5" />
          </button>
        </div>
      </div>
    </Link>
  );
};
