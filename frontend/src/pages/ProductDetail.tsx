import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { productService } from '../api/productService';
import { categoryService } from '../api/categoryService';
import { reviewService } from '../api/reviewService';
import { useCart } from '../context/CartContext';
import { useWishlist } from '../context/WishlistContext';
import { ReviewSection } from '../components/review/ReviewSection';
import { StarRating } from '../components/review/StarRating';
import type { Product, Category, ProductRating } from '../types';
import { ShoppingCart, Heart, ArrowLeft, Plus, Minus, ShieldCheck, AlertTriangle, PackageX, PackageCheck, Truck } from 'lucide-react';

export const ProductDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { addToCart } = useCart();
  const { isInWishlist, addToWishlist, removeFromWishlist } = useWishlist();
  const [product, setProduct] = useState<Product | null>(null);
  const [category, setCategory] = useState<Category | null>(null);
  const [rating, setRating] = useState<ProductRating | null>(null);
  const [quantity, setQuantity] = useState(1);
  const [isLoading, setIsLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  useEffect(() => {
    const fetchProductDetails = async () => {
      if (!id) return;
      setIsLoading(true);
      setErrorMessage(null);
      try {
        const productResponse = await productService.getProductById(id);
        const productData = productResponse.data;
        setProduct(productData);

        if (productData.categoryId) {
          const categoryResponse = await categoryService.getCategoryById(productData.categoryId);
          setCategory(categoryResponse.data);
        }

        // Ürünün puan özetini de yükle (ortalama puan + yorum sayısı)
        try {
          const ratingResponse = await reviewService.getProductRating(id);
          setRating(ratingResponse.data);
        } catch (ratingError) {
          console.error('Error fetching product rating:', ratingError);
        }
      } catch (error) {
        console.error('Error fetching product details:', error);
        setErrorMessage('Ürün bulunamadı veya sunucu hatası oluştu.');
      } finally {
        setIsLoading(false);
      }
    };

    fetchProductDetails();
  }, [id]);

  const incrementQty = () => {
    if (product && quantity < product.stockQuantity) {
      setQuantity((q) => q + 1);
    }
  };

  const decrementQty = () => {
    if (quantity > 1) {
      setQuantity((q) => q - 1);
    }
  };

  const handleAddToCart = () => {
    if (!product) return;
    addToCart(product.id, quantity);
  };

  const handleToggleWishlist = () => {
    if (!product) return;
    if (isInWishlist(product.id)) {
      removeFromWishlist(product.id);
    } else {
      addToWishlist(product.id);
    }
  };

  const inWishlist = product ? isInWishlist(product.id) : false;

  if (isLoading) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center py-20 bg-slate-50 text-slate-800">
        <div className="w-12 h-12 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin"></div>
        <p className="text-slate-500 mt-4 font-medium">Ürün Detayı Yükleniyor...</p>
      </div>
    );
  }

  if (errorMessage || !product) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center py-20 bg-slate-50 text-slate-800 px-6">
        <div className="max-w-md w-full bg-white border border-slate-200 rounded-2xl p-8 text-center shadow-sm">
          <AlertTriangle className="w-12 h-12 text-red-500 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-slate-900 mb-2">Hata</h2>
          <p className="text-slate-500 text-sm mb-6">{errorMessage || 'Ürün bulunamadı.'}</p>
          <Link
            to="/"
            className="inline-flex items-center space-x-2 bg-indigo-600 hover:bg-indigo-500 text-white font-semibold py-2.5 px-6 rounded-lg transition-colors cursor-pointer"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Kataloğa Dön</span>
          </Link>
        </div>
      </div>
    );
  }

  const isOutOfStock = product.stockQuantity <= 0;

  return (
    <div className="bg-slate-50 text-slate-800 flex-1">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <button
          onClick={() => navigate(-1)}
          className="inline-flex items-center space-x-2 text-slate-500 hover:text-indigo-600 mb-8 transition-colors cursor-pointer font-medium text-sm"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Geri Dön</span>
        </button>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-start">
          <div className="aspect-square bg-white rounded-2xl border border-slate-200 flex items-center justify-center text-slate-300 shadow-sm relative overflow-hidden">
            <ShoppingCart className="w-32 h-32 text-slate-200" />
            {!product.active && (
              <span className="absolute top-4 left-4 bg-amber-50 border border-amber-200 text-amber-600 text-xs px-3 py-1 rounded-md font-semibold">
                Pasif Ürün
              </span>
            )}
          </div>

          <div className="space-y-6">
            <div>
              {category && (
                <span className="text-xs text-indigo-600 font-extrabold uppercase tracking-widest bg-indigo-50 border border-indigo-100 px-2.5 py-1 rounded-md">
                  {category.name}
                </span>
              )}
              <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight mt-4 text-slate-900">
                {product.name}
              </h1>
            </div>

            <div className="py-2 flex items-center justify-between">
              <div>
                <span className="text-slate-500 text-x block uppercase tracking-wider font-bold">Fiyat</span>
                <span className="text-3xl font-black text-indigo-700">
                  {product.price.toLocaleString('tr-TR', { style: 'currency', currency: 'TRY' })}
                </span>
              </div>

              {/* Ortalama puan + yorum sayısı */}
              {rating && rating.totalReviews > 0 && (
                <div className="flex flex-col items-end gap-1">
                  <StarRating rating={rating.averageRating} size={18} showValue />
                  <span className="text-xs text-slate-400">
                    {rating.totalReviews} değerlendirme
                  </span>
                </div>
              )}
            </div>

            <div className="text-slate-600 text-sm leading-relaxed">
              <h3 className="text-slate-900 font-semibold mb-1">Ürün Açıklaması</h3>
              <p>{product.description}</p>
            </div>

            {/* Stock Status */}
            <div className={`flex items-center space-x-2 text-sm font-semibold ${isOutOfStock ? 'text-red-600' : 'text-emerald-600'}`}>
              {isOutOfStock ? (
                <>
                  <PackageX className="w-5 h-5" />
                  <span>Stokta Yok</span>
                </>
              ) : (
                <>
                  <PackageCheck className="w-5 h-5" />
                  <span>{product.stockQuantity} adet Stokta</span>
                </>
              )}
            </div>

            {!isOutOfStock && (
              <div className="space-y-2 pt-2">
                <div className="flex items-center space-x-4">
                  <div className="flex items-center bg-white border border-slate-300 rounded-lg overflow-hidden">
                    <button
                      onClick={decrementQty}
                      disabled={quantity <= 1}
                      className="p-2.5 hover:bg-gray-200 transition-colors disabled:opacity-50 cursor-pointer disabled:cursor-not-allowed text-slate-600"
                    >
                      <Minus className="w-4 h-4" />
                    </button>
                    <span className="px-4 text-slate-800 font-extrabold text-sm">{quantity}</span>
                    <button
                      onClick={incrementQty}
                      disabled={quantity >= product.stockQuantity}
                      className="p-2.5 hover:bg-gray-200 transition-colors disabled:opacity-50 cursor-pointer disabled:cursor-not-allowed text-slate-600"
                    >
                      <Plus className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                <div className="flex gap-4 pt-2">
                  <button
                    onClick={handleAddToCart}
                    className="flex-grow bg-indigo-500 hover:bg-indigo-500 text-white font-semibold py-3.5 px-8 rounded-xl transition-all shadow-lg shadow-indigo-500/20 hover:shadow-indigo-500/35 flex items-center justify-center space-x-2 cursor-pointer text-sm"
                  >
                    <ShoppingCart className="w-5 h-5" />
                    <span>Sepete Ekle</span>
                  </button>
                  <button
                    onClick={handleToggleWishlist}
                    className={`flex-grow font-semibold py-3.5 px-8 rounded-xl transition-all flex items-center justify-center space-x-2 cursor-pointer text-sm border ${
                      inWishlist
                        ? 'bg-rose-50 border-rose-300 text-rose-600 hover:bg-rose-100'
                        : 'bg-white border-slate-300 text-slate-700 hover:border-rose-300 hover:text-rose-500'
                    }`}
                  >
                    <Heart className={`w-5 h-5 ${inWishlist ? 'fill-current' : ''}`} />
                    <span>{inWishlist ? 'Favorilerde' : 'Favorilere Ekle'}</span>
                  </button>
                </div>
              </div>
            )}

            {isOutOfStock && (
              <button
                disabled
                className="flex-grow w-full bg-slate-100 text-slate-400 font-semibold py-3.5 px-8 rounded-xl flex items-center justify-center space-x-2 text-sm cursor-not-allowed"
              >
                <ShoppingCart className="w-5 h-5" />
                <span>Stokta Yok</span>
              </button>
            )}

            <div className="grid gap-2 text-xs text-slate-500 mt-4 pt-4">
              <div className="flex items-center space-x-2">
                <ShieldCheck className="w-5 h-5 text-indigo-500 shrink-0" />
                <span>%100 Güvenli Alışveriş</span>
              </div>
              <div className="flex items-center space-x-2">
                <Truck className="w-5 h-5 text-indigo-500 shrink-0" />
                <span>Aynı Gün Kargo</span>
              </div>
              <div className="flex items-center space-x-2">
                <PackageCheck className="w-5 h-5 text-indigo-500 shrink-0" />
                <span>14 Gün İçinde Koşulsuz İade Garantisi</span>
              </div>
            </div>
          </div>
        </div>

        {/* Ürün Yorumları & Puanlama */}
        {id && <ReviewSection productId={id} />}
      </div>
    </div>
  );
};
