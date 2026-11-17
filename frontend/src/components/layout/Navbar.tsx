import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useCart } from '../../context/CartContext';
import { useWishlist } from '../../context/WishlistContext';
import { productService } from '../../api/productService';
import { categoryService } from '../../api/categoryService';
import type { Category, Product } from '../../types';
import { ShoppingCart, Heart, Search, LogOut, User as UserIcon, Menu, X } from 'lucide-react';

export const Navbar: React.FC = () => {
  const { user, isAuthenticated, logout } = useAuth();
  const { itemCount, toggleCart } = useCart();
  const { itemCount: wishlistCount, toggleWishlist } = useWishlist();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [searchQuery, setSearchQuery] = useState(searchParams.get('searchQuery') || '');
  const [categories, setCategories] = useState<Category[]>([]);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  // Suggestions state
  const [suggestions, setSuggestions] = useState<Product[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [isSearchingSuggestions, setIsSearchingSuggestions] = useState(false);

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const response = await categoryService.getAllCategories();
        setCategories(response.data);
      } catch (error) {
        console.error('Error fetching categories in navbar:', error);
      }
    };
    fetchCategories();
  }, []);

  // Sync searchQuery with URL param changes
  useEffect(() => {
    setSearchQuery(searchParams.get('searchQuery') || '');
  }, [searchParams]);

  // Debounced search suggestions fetch
  useEffect(() => {
    const trimmed = searchQuery.trim();
    if (trimmed.length > 0) {
      const delayDebounceFn = setTimeout(async () => {
        setIsSearchingSuggestions(true);
        try {
          const response = await productService.getProducts({ searchQuery: trimmed, size: 6 });
          setSuggestions(response.data.content);
        } catch (error) {
          console.error('Error fetching search suggestions:', error);
        } finally {
          setIsSearchingSuggestions(false);
        }
      }, 300);

      return () => clearTimeout(delayDebounceFn);
    } else {
      setSuggestions([]);
      setShowSuggestions(false);
    }
  }, [searchQuery]);

  const handleSearchChange = (value: string) => {
    setSearchQuery(value);
    if (value.trim()) {
      setShowSuggestions(true);
    } else {
      setShowSuggestions(false);
    }
  };

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const trimmed = searchQuery.trim();
    const params = new URLSearchParams(searchParams);
    if (trimmed) {
      params.set('searchQuery', trimmed);
    } else {
      params.delete('searchQuery');
    }
    params.delete('page');
    navigate(`/?${params.toString()}`);
    setShowSuggestions(false);
  };

  const handleInputBlur = () => {
    setTimeout(() => {
      setShowSuggestions(false);
    }, 200);
  };

  const handleInputFocus = () => {
    if (searchQuery.trim().length > 0) {
      setShowSuggestions(true);
    }
  };

  const getCategoryName = (categoryId: string) => {
    return categories.find((c) => c.id === categoryId)?.name || 'Kategori';
  };

  return (
    <nav className="bg-slate-900 border-b border-slate-800 text-slate-800 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <Link to="/" className="shrink-0 flex items-center mr-4">
            <img src="/assets/TeknoPazar-Icon.svg" alt="TeknoPazar" className="h-9 w-auto" />
          </Link>
          <div className="flex-1 max-w-md mx-8 hidden sm:block relative">
            <form onSubmit={handleSearchSubmit} className="relative">
              <input
                type="text"
                placeholder="Ürün ara..."
                value={searchQuery}
                onChange={(e) => handleSearchChange(e.target.value)}
                onFocus={handleInputFocus}
                onBlur={handleInputBlur}
                className="w-full bg-slate-850 text-slate-800 border border-slate-700 rounded-lg py-1.5 pl-4 pr-10 text-sm focus:outline-none focus:border-indigo-500 transition-colors"
              />
              <button type="submit" className="absolute right-3 top-2 text-slate-400 hover:text-indigo-650 cursor-pointer">
                <Search className="w-4 h-4" />
              </button>

              {showSuggestions && (
                <div className="absolute left-0 right-0 mt-1.5 bg-white border border-slate-700 rounded-lg shadow-xl z-50 overflow-hidden divide-y divide-slate-750 max-h-96 overflow-y-auto">
                  {isSearchingSuggestions ? (
                    <div className="py-4 text-center text-xs text-slate-500 flex items-center justify-center space-x-2">
                      <div className="w-4 h-4 border-2 border-indigo-600 border-t-transparent rounded-full animate-spin"></div>
                      <span>Aranıyor...</span>
                    </div>
                  ) : suggestions.length > 0 ? (
                    <>
                      {suggestions.map((product) => (
                        <button
                          key={product.id}
                          type="button"
                          onClick={() => {
                            navigate(`/products/${product.id}`);
                            setShowSuggestions(false);
                          }}
                          className="w-full text-left py-2.5 px-4 hover:bg-slate-855 text-sm flex items-center justify-between transition-colors cursor-pointer group"
                        >
                          <div className="flex items-center space-x-3">
                            <Search className="w-3.5 h-3.5 text-slate-400 group-hover:text-indigo-600" />
                            <span className="text-slate-800 font-medium group-hover:text-indigo-650">{product.name}</span>
                          </div>
                          <span className="text-[10px] text-slate-500 uppercase tracking-wider bg-slate-855 px-2 py-0.5 rounded font-semibold">
                            {getCategoryName(product.categoryId)}
                          </span>
                        </button>
                      ))}
                      <button
                        type="button"
                        onClick={() => {
                          navigate(`/?searchQuery=${encodeURIComponent(searchQuery.trim())}`);
                          setShowSuggestions(false);
                        }}
                        className="w-full text-left py-2.5 px-4 hover:bg-indigo-50/50 text-xs text-indigo-650 font-bold flex items-center justify-between border-t border-slate-750 cursor-pointer"
                      >
                        <span>"{searchQuery}" ile ilgili tüm sonuçları gör</span>
                        <Search className="w-3.5 h-3.5 text-indigo-605" />
                      </button>
                    </>
                  ) : (
                    <div className="py-4 px-4 text-xs text-slate-500 text-center">
                      "{searchQuery}" için sonuç bulunamadı.
                    </div>
                  )}
                </div>
              )}
            </form>
          </div>

          <div className="flex items-center space-x-2">
            <button
              onClick={toggleWishlist}
              className="relative p-2 text-slate-900 hover:text-rose-500 hover:bg-slate-855 rounded-lg transition-colors cursor-pointer flex items-center justify-center"
              title="Favorilerim"
            >
              <Heart className="w-6 h-6" />
              {wishlistCount > 0 && (
                <span className="absolute -top-1 -right-1 bg-rose-500 text-white text-[10px] font-bold rounded-full w-4 h-4 flex items-center justify-center">
                  {wishlistCount}
                </span>
              )}
            </button>

            <button
              onClick={toggleCart}
              className="relative p-2 text-slate-900 hover:text-indigo-650 hover:bg-slate-855 rounded-lg transition-colors cursor-pointer flex items-center justify-center"
              title="Sepetim"
            >
              <ShoppingCart className="w-6 h-6" />
              {itemCount > 0 && (
                <span className="absolute -top-1 -right-1 bg-indigo-650 text-white text-[10px] font-bold rounded-full w-4 h-4 flex items-center justify-center">
                  {itemCount}
                </span>
              )}
            </button>

            <div className="hidden md:flex items-center space-x-2">
              {isAuthenticated ? (
                <div className="flex items-center space-x-2">
                  <Link
                    to="/profile"
                    className="p-2 text-slate-900 hover:text-indigo-650 hover:bg-slate-855 rounded-lg transition-colors cursor-pointer flex items-center space-x-1.5 text-sm"
                    title="Profilim"
                  >
                    <UserIcon className="w-5 h-5 text-indigo-600" />
                    <span className="max-w-[100px] truncate font-medium">{user?.firstName}</span>
                  </Link>
                  <button
                    onClick={logout}
                    className="p-2 text-slate-900 hover:text-red-500 hover:bg-slate-855 rounded-lg transition-colors cursor-pointer flex items-center justify-center"
                    title="Çıkış Yap"
                  >
                    <LogOut className="w-5 h-5" />
                  </button>
                </div>
              ) : (
                <div className="flex items-center space-x-2">
                  <Link
                    to="/login"
                    className="text-slate-400 hover:text-indigo-650 text-sm font-semibold py-1.5 px-3 transition-colors"
                  >
                    Giriş Yap
                  </Link>
                  <Link
                    to="/register"
                    className="bg-indigo-600 hover:bg-indigo-500 text-white text-sm font-semibold py-1.5 px-3 rounded-lg transition-colors shadow-md shadow-indigo-500/20"
                  >
                    Kayıt Ol
                  </Link>
                </div>
              )}
            </div>

            <button
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="md:hidden p-2 text-slate-400 hover:text-indigo-600 focus:outline-none"
            >
              {isMobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>
      </div>

      {isMobileMenuOpen && (
        <div className="md:hidden bg-slate-900 border-t border-slate-800 px-4 pt-2 pb-4 space-y-3">
          <form onSubmit={handleSearchSubmit} className="relative">
            <input
              type="text"
              placeholder="Ürün ara..."
              value={searchQuery}
              onChange={(e) => handleSearchChange(e.target.value)}
              onFocus={handleInputFocus}
              onBlur={handleInputBlur}
              className="w-full bg-slate-850 text-slate-800 border border-slate-700 rounded-lg py-2 pl-4 pr-10 text-sm focus:outline-none focus:border-indigo-500"
            />
            <button type="submit" className="absolute right-3 top-2.5 text-slate-400 hover:text-indigo-650">
              <Search className="w-4 h-4" />
            </button>

            {showSuggestions && (
              <div className="absolute left-0 right-0 mt-1.5 bg-white border border-slate-700 rounded-lg shadow-xl z-50 overflow-hidden divide-y divide-slate-750 max-h-96 overflow-y-auto">
                {isSearchingSuggestions ? (
                  <div className="py-4 text-center text-xs text-slate-500 flex items-center justify-center space-x-2">
                    <div className="w-4 h-4 border-2 border-indigo-600 border-t-transparent rounded-full animate-spin"></div>
                    <span>Aranıyor...</span>
                  </div>
                ) : suggestions.length > 0 ? (
                  <>
                    {suggestions.map((product) => (
                      <button
                        key={product.id}
                        type="button"
                        onClick={() => {
                          navigate(`/products/${product.id}`);
                          setShowSuggestions(false);
                          setIsMobileMenuOpen(false);
                        }}
                        className="w-full text-left py-2.5 px-4 hover:bg-slate-855 text-sm flex items-center justify-between transition-colors cursor-pointer group"
                      >
                        <div className="flex items-center space-x-3">
                          <Search className="w-3.5 h-3.5 text-slate-400 group-hover:text-indigo-600" />
                          <span className="text-slate-800 font-medium group-hover:text-indigo-655">{product.name}</span>
                        </div>
                        <span className="text-[10px] text-slate-500 uppercase tracking-wider bg-slate-855 px-2 py-0.5 rounded font-semibold">
                          {getCategoryName(product.categoryId)}
                        </span>
                      </button>
                    ))}
                    <button
                      type="button"
                      onClick={() => {
                        navigate(`/?searchQuery=${encodeURIComponent(searchQuery.trim())}`);
                        setShowSuggestions(false);
                        setIsMobileMenuOpen(false);
                      }}
                      className="w-full text-left py-2.5 px-4 hover:bg-indigo-50/50 text-xs text-indigo-650 font-bold flex items-center justify-between border-t border-slate-750 cursor-pointer"
                    >
                      <span>"{searchQuery}" ile ilgili tüm sonuçları gör</span>
                      <Search className="w-3.5 h-3.5 text-indigo-605" />
                    </button>
                  </>
                ) : (
                  <div className="py-4 px-4 text-xs text-slate-500 text-center">
                    "{searchQuery}" için sonuç bulunamadı.
                  </div>
                )}
              </div>
            )}
          </form>

          <div className="space-y-1">
            <span className="block text-slate-500 text-xs font-bold uppercase tracking-wider px-2 mb-1">
              Kategoriler
            </span>
            <Link
              to="/"
              onClick={() => setIsMobileMenuOpen(false)}
              className="block text-slate-400 hover:text-indigo-600 py-1.5 px-2 rounded text-sm transition-colors"
            >
              Tüm Ürünler
            </Link>
            {categories.map((category) => (
              <Link
                key={category.id}
                to={`/?categoryId=${category.id}`}
                onClick={() => setIsMobileMenuOpen(false)}
                className="block text-slate-900 hover:text-indigo-600 py-1.5 px-2 rounded text-sm transition-colors"
              >
                {category.name}
              </Link>
            ))}
          </div>

          <div className="border-t border-slate-800 pt-3">
            {isAuthenticated ? (
              <div className="space-y-2">
                <div className="flex items-center space-x-2 px-2 text-sm text-slate-400">
                  <UserIcon className="w-4 h-4 text-indigo-600" />
                  <span>{user?.firstName} {user?.lastName}</span>
                </div>
                <div className="flex gap-2">
                  <Link
                    to="/profile"
                    onClick={() => setIsMobileMenuOpen(false)}
                    className="flex-1 bg-slate-100 hover:bg-slate-200 text-center py-2 rounded text-sm text-slate-800 font-medium"
                  >
                    Profil
                  </Link>
                  <button
                    onClick={() => {
                      setIsMobileMenuOpen(false);
                      logout();
                    }}
                    className="flex-1 bg-red-650 hover:bg-red-600 text-center py-2 rounded text-sm text-white font-medium"
                  >
                    Çıkış Yap
                  </button>
                </div>
              </div>
            ) : (
              <div className="flex gap-2">
                <Link
                  to="/login"
                  onClick={() => setIsMobileMenuOpen(false)}
                  className="flex-1 bg-slate-100 hover:bg-slate-200 text-center py-2 rounded text-sm text-slate-800 font-medium"
                >
                  Giriş Yap
                </Link>
                <Link
                  to="/register"
                  onClick={() => setIsMobileMenuOpen(false)}
                  className="flex-1 bg-indigo-600 text-center py-2 rounded text-sm text-white font-medium"
                >
                  Kayıt Ol
                </Link>
              </div>
            )}
          </div>
        </div>
      )}
    </nav>
  );
};
