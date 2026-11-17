import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { productService } from '../api/productService';
import { categoryService } from '../api/categoryService';
import { ProductFilter } from '../components/product/ProductFilter';
import { ProductCard } from '../components/product/ProductCard';
import { Pagination } from '../components/common/Pagination';
import type { Product, Category, ProductFilterParams } from '../types';
import { RefreshCw, LayoutGrid } from 'lucide-react';

export const Home: React.FC = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const [categories, setCategories] = useState<Category[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [totalPages, setTotalPages] = useState(0);
  const [totalElements, setTotalElements] = useState(0);
  const [isLoading, setIsLoading] = useState(true);

  const filters: ProductFilterParams = {
    searchQuery: searchParams.get('searchQuery') || undefined,
    categoryId: searchParams.get('categoryId') || undefined,
    minPrice: searchParams.get('minPrice')
      ? Math.max(0, Number(searchParams.get('minPrice')))
      : undefined,
    maxPrice: searchParams.get('maxPrice') ? Number(searchParams.get('maxPrice')) : undefined,
    inStockOnly: searchParams.get('inStockOnly') === 'true' ? true : undefined,
    sortBy: searchParams.get('sortBy') || undefined,
    sortDirection: searchParams.get('sortDirection') || undefined,
    page: searchParams.get('page') ? Number(searchParams.get('page')) : 0,
    size: 9,
  };

  useEffect(() => {
    const loadCategories = async () => {
      try {
        const response = await categoryService.getAllCategories();
        setCategories(response.data);
      } catch (error) {
        console.error('Error fetching categories:', error);
      }
    };
    loadCategories();
  }, []);

  useEffect(() => {
    const loadProducts = async () => {
      setIsLoading(true);
      try {
        const response = await productService.getProducts(filters);
        setProducts(response.data.content);
        setTotalPages(response.data.totalPages);
        setTotalElements(response.data.totalElements);
      } catch (error) {
        console.error('Error fetching products:', error);
      } finally {
        setIsLoading(false);
      }
    };
    loadProducts();
  }, [
    searchParams.get('searchQuery'),
    searchParams.get('categoryId'),
    searchParams.get('minPrice'),
    searchParams.get('maxPrice'),
    searchParams.get('inStockOnly'),
    searchParams.get('sortBy'),
    searchParams.get('sortDirection'),
    searchParams.get('page'),
  ]);

  const handleFilterChange = (newFilters: ProductFilterParams) => {
    const params: Record<string, string> = {};
    if (newFilters.searchQuery) params.searchQuery = newFilters.searchQuery;
    if (newFilters.categoryId) params.categoryId = newFilters.categoryId;
    if (newFilters.minPrice !== undefined) params.minPrice = String(newFilters.minPrice);
    if (newFilters.maxPrice !== undefined) params.maxPrice = String(newFilters.maxPrice);
    if (newFilters.inStockOnly) params.inStockOnly = 'true';
    if (newFilters.sortBy) params.sortBy = newFilters.sortBy;
    if (newFilters.sortDirection) params.sortDirection = newFilters.sortDirection;
    if (newFilters.page !== undefined && newFilters.page > 0) params.page = String(newFilters.page);

    setSearchParams(params);
  };

  const handlePageChange = (page: number) => {
    handleFilterChange({ ...filters, page });
  };



  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 flex-1 flex flex-col">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">Ürün Kataloğu</h1>
          <p className="text-slate-400 text-sm mt-1">Geniş ürün yelpazemizi keşfedin</p>
        </div>
        <div className="flex items-center space-x-2 text-slate-400 text-sm font-medium bg-slate-800 px-4 py-2 rounded-lg border border-slate-700">
          <LayoutGrid className="w-4 h-4 text-indigo-400" />
          <span>Toplam {totalElements} ürün</span>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8 items-start flex-grow">
        <div className="lg:col-span-1">
          <ProductFilter
            filters={filters}
            categories={categories}
            onChange={handleFilterChange}
          />
        </div>

        <div className="lg:col-span-3 flex flex-col h-full justify-between">
          {isLoading ? (
            <div className="flex-grow flex flex-col items-center justify-center py-20 space-y-4">
              <RefreshCw className="w-10 h-10 text-indigo-500 animate-spin" />
              <p className="text-slate-400 font-medium">Ürünler Yükleniyor...</p>
            </div>
          ) : products.length === 0 ? (
            <div className="flex-grow bg-slate-800/40 border border-slate-800 rounded-2xl p-16 text-center flex flex-col items-center justify-center py-20">
              <p className="text-slate-400 text-lg font-medium">Aradığınız kriterlere uygun ürün bulunamadı.</p>
              <button
                onClick={() => handleFilterChange({})}
                className="mt-4 text-indigo-400 hover:text-indigo-300 font-semibold text-sm cursor-pointer"
              >
                Tüm Filtreleri Sıfırla
              </button>
            </div>
          ) : (
            <div>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {products.map((product) => {
                  const cat = categories.find((c) => c.id === product.categoryId);
                  return (
                    <ProductCard
                      key={product.id}
                      product={product}
                      categoryName={cat?.name}
                    />
                  );
                })}
              </div>

              <Pagination
                currentPage={filters.page || 0}
                totalPages={totalPages}
                onPageChange={handlePageChange}
              />
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
