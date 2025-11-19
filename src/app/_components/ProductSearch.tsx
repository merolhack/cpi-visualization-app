// src/app/_components/ProductSearch.tsx
'use client';

import { useState, useEffect, useRef } from 'react';
import { createClient } from '@/app/lib/supabase/client';
import { useRouter } from 'next/navigation';

interface Product {
  product_id: number;
  product_name: string;
  category_name: string;
  country_name: string;
}

export default function ProductSearch() {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<Product[]>([]);
  const [loading, setLoading] = useState(false);
  const [showResults, setShowResults] = useState(false);
  const searchRef = useRef<HTMLDivElement>(null);
  const router = useRouter();
  const supabase = createClient();

  // Cerrar resultados al hacer clic fuera
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (searchRef.current && !searchRef.current.contains(event.target as Node)) {
        setShowResults(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Buscar productos
  useEffect(() => {
    const searchProducts = async () => {
      if (query.trim().length < 2) {
        setResults([]);
        setShowResults(false);
        return;
      }

      setLoading(true);
      setShowResults(true);

      try {
        const { data, error } = await supabase
          .from('cpi_products')
          .select(`
            product_id,
            product_name,
            cpi_categories!inner(category_name),
            cpi_countries!inner(country_name)
          `)
          .eq('is_active_product', true)
          .ilike('product_name', `%${query}%`)
          .limit(10);

        if (error) throw error;

        // Transformar datos
        const products: Product[] = (data || []).map((item: any) => ({
          product_id: item.product_id,
          product_name: item.product_name,
          category_name: item.cpi_categories?.category_name || 'Sin categoría',
          country_name: item.cpi_countries?.country_name || 'Sin país',
        }));

        setResults(products);
      } catch (err) {
        console.error('Error buscando productos:', err);
        setResults([]);
      } finally {
        setLoading(false);
      }
    };

    const debounce = setTimeout(() => {
      searchProducts();
    }, 300);

    return () => clearTimeout(debounce);
  }, [query, supabase]);

  const handleSelectProduct = (productId: number) => {
    setShowResults(false);
    setQuery('');
    router.push(`/product/${productId}`);
  };

  return (
    <div ref={searchRef} className="relative w-full max-w-xl">
      <div className="relative">
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onFocus={() => query.length >= 2 && setShowResults(true)}
          placeholder="Buscar producto... (ej: leche, pan, arroz)"
          className="w-full px-4 py-3 pr-12 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
        />
        <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
          {loading ? (
            <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-blue-600"></div>
          ) : (
            <svg 
              className="w-5 h-5 text-gray-400" 
              fill="none" 
              stroke="currentColor" 
              viewBox="0 0 24 24"
            >
              <path 
                strokeLinecap="round" 
                strokeLinejoin="round" 
                strokeWidth={2} 
                d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" 
              />
            </svg>
          )}
        </div>
      </div>

      {showResults && results.length > 0 && (
        <div className="absolute z-50 w-full mt-2 bg-white border border-gray-200 rounded-lg shadow-lg max-h-96 overflow-y-auto">
          {results.map((product) => (
            <button
              key={product.product_id}
              onClick={() => handleSelectProduct(product.product_id)}
              className="w-full px-4 py-3 text-left hover:bg-gray-50 border-b border-gray-100 last:border-b-0 transition-colors"
            >
              <div className="font-medium text-gray-800">
                {product.product_name}
              </div>
              <div className="text-xs text-gray-500 mt-1">
                {product.category_name} • {product.country_name}
              </div>
            </button>
          ))}
        </div>
      )}

      {showResults && query.length >= 2 && !loading && results.length === 0 && (
        <div className="absolute z-50 w-full mt-2 bg-white border border-gray-200 rounded-lg shadow-lg p-4">
          <p className="text-gray-500 text-sm text-center">
            No se encontraron productos que coincidan con "{query}"
          </p>
        </div>
      )}

      {query.length > 0 && query.length < 2 && (
        <p className="text-xs text-gray-500 mt-1">
          Escribe al menos 2 caracteres para buscar
        </p>
      )}
    </div>
  );
}