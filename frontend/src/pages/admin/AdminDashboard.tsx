import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { productService } from '../../api/productService';
import { categoryService } from '../../api/categoryService';
import { adminCouponService } from '../../api/adminCouponService';
import { ShoppingBag, FolderOpen, ClipboardList, ArrowRight, TrendingUp, Tag } from 'lucide-react';

export const AdminDashboard: React.FC = () => {
  const [productCount, setProductCount] = useState<number | null>(null);
  const [categoryCount, setCategoryCount] = useState<number | null>(null);
  const [couponCount, setCouponCount] = useState<number | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      setIsLoading(true);
      try {
        const [productsRes, categoriesRes, couponsRes] = await Promise.all([
          productService.getProducts({ size: 1 }),
          categoryService.getAllCategories(),
          adminCouponService.getAllCoupons(),
        ]);
        setProductCount(productsRes.data.totalElements);
        setCategoryCount(categoriesRes.data.length);
        setCouponCount(couponsRes.data.length);
      } catch (error) {
        console.error('Error fetching dashboard stats:', error);
      } finally {
        setIsLoading(false);
      }
    };
    fetchStats();
  }, []);

  return (
    <div className="space-y-8 animate-fade-in">
      <div>
        <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">Admin Paneli</h1>
        <p className="text-slate-500 text-sm mt-1">Mağazanın genel istatistikleri ve yönetim araçları.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6">
        <div className="bg-slate-900 border border-slate-700 rounded-xl p-6 flex items-center justify-between">
          <div className="space-y-2">
            <span className="text-slate-500 text-sm font-semibold uppercase tracking-wider block">Toplam Ürün</span>
            <span className="text-3xl font-black text-slate-900">
              {isLoading ? '...' : productCount ?? 0}
            </span>
            <Link to="/admin/products" className="text-xs text-indigo-600 hover:text-indigo-700 font-semibold flex items-center space-x-1 pt-1">
              <span>Ürün Yönetimine Git</span>
              <ArrowRight className="w-3 h-3" />
            </Link>
          </div>
          <div className="bg-indigo-500/10 border border-indigo-500/20 p-4 rounded-xl text-indigo-600">
            <ShoppingBag className="w-8 h-8" />
          </div>
        </div>

        <div className="bg-slate-900 border border-slate-700 rounded-xl p-6 flex items-center justify-between">
          <div className="space-y-2">
            <span className="text-slate-500 text-sm font-semibold uppercase tracking-wider block">Kategori</span>
            <span className="text-3xl font-black text-slate-900">
              {isLoading ? '...' : categoryCount ?? 0}
            </span>
            <Link to="/admin/categories" className="text-xs text-indigo-600 hover:text-indigo-700 font-semibold flex items-center space-x-1 pt-1">
              <span>Kategori Yönetimine Git</span>
              <ArrowRight className="w-3 h-3" />
            </Link>
          </div>
          <div className="bg-indigo-500/10 border border-indigo-500/20 p-4 rounded-xl text-indigo-600">
            <FolderOpen className="w-8 h-8" />
          </div>
        </div>

        <div className="bg-slate-900 border border-slate-700 rounded-xl p-6 flex items-center justify-between">
          <div className="space-y-2">
            <span className="text-slate-500 text-sm font-semibold uppercase tracking-wider block">Siparişler</span>
            <span className="text-sm font-semibold text-slate-600 block">Sipariş durum güncelleme</span>
            <Link to="/admin/orders" className="text-xs text-indigo-600 hover:text-indigo-700 font-semibold flex items-center space-x-1 pt-1">
              <span>Siparişleri Gör</span>
              <ArrowRight className="w-3 h-3" />
            </Link>
          </div>
          <div className="bg-indigo-500/10 border border-indigo-500/20 p-4 rounded-xl text-indigo-600">
            <ClipboardList className="w-8 h-8" />
          </div>
        </div>

        <div className="bg-slate-900 border border-slate-700 rounded-xl p-6 flex items-center justify-between">
          <div className="space-y-2">
            <span className="text-slate-500 text-sm font-semibold uppercase tracking-wider block">Kuponlar</span>
            <span className="text-3xl font-black text-slate-900">
              {isLoading ? '...' : couponCount ?? 0}
            </span>
            <Link to="/admin/coupons" className="text-xs text-indigo-600 hover:text-indigo-700 font-semibold flex items-center space-x-1 pt-1">
              <span>Kupon Yönetimine Git</span>
              <ArrowRight className="w-3 h-3" />
            </Link>
          </div>
          <div className="bg-indigo-500/10 border border-indigo-500/20 p-4 rounded-xl text-indigo-600">
            <Tag className="w-8 h-8" />
          </div>
        </div>
      </div>

      <div className="bg-slate-900 border border-slate-700 rounded-2xl p-8 space-y-6">
        <h3 className="text-lg font-bold text-slate-900 flex items-center space-x-2">
          <TrendingUp className="w-5 h-5 text-indigo-600" />
          <span>Hızlı İşlemler</span>
        </h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          <Link
            to="/admin/products"
            className="p-4 bg-slate-850 hover:bg-slate-855 border border-slate-700/50 hover:border-slate-700 rounded-xl transition-all space-y-2 group"
          >
            <h4 className="font-semibold text-slate-900 group-hover:text-indigo-600 transition-colors">Yeni Ürün Ekle</h4>
            <p className="text-xs text-slate-500 leading-relaxed">Kataloğa yeni fiyat, stok ve açıklamalarla ürün tanımlayın.</p>
          </Link>
          <Link
            to="/admin/categories"
            className="p-4 bg-slate-850 hover:bg-slate-855 border border-slate-700/50 hover:border-slate-700 rounded-xl transition-all space-y-2 group"
          >
            <h4 className="font-semibold text-slate-900 group-hover:text-indigo-600 transition-colors">Kategori Düzenle</h4>
            <p className="text-xs text-slate-500 leading-relaxed">Yeni ürün grupları ve koleksiyonlar oluşturun.</p>
          </Link>
          <Link
            to="/admin/orders"
            className="p-4 bg-slate-850 hover:bg-slate-855 border border-slate-700/50 hover:border-slate-700 rounded-xl transition-all space-y-2 group"
          >
            <h4 className="font-semibold text-slate-900 group-hover:text-indigo-600 transition-colors">Sipariş Yönetimi</h4>
            <p className="text-xs text-slate-500 leading-relaxed">Dağıtım aşamasındaki siparişlerin statülerini güncelleyin.</p>
          </Link>
          <Link
            to="/admin/coupons"
            className="p-4 bg-slate-850 hover:bg-slate-855 border border-slate-700/50 hover:border-slate-700 rounded-xl transition-all space-y-2 group"
          >
            <h4 className="font-semibold text-slate-900 group-hover:text-indigo-600 transition-colors flex items-center space-x-1.5">
              <span>Kupon Oluştur</span>
            </h4>
            <p className="text-xs text-slate-500 leading-relaxed">Müşterilerinize özel indirim kuponları tanımlayın.</p>
          </Link>
        </div>
      </div>
    </div>
  );
};