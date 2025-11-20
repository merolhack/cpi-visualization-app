'use client';

import { useEffect, useState } from 'react';
import { createClient } from '@/app/lib/supabase/client';
import Link from 'next/link';

type ProductChange = {
  product_id: number;
  product_name: string;
  product_photo_url: string | null;
  current_price: number;
  previous_price: number;
  price_change_percentage: number;
  last_update_date: string;
  establishment_name: string;
  location_name: string;
};

export default function ProductPriceChangeCarousel() {
  const [products, setProducts] = useState<ProductChange[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentIndex, setCurrentIndex] = useState(0);

  useEffect(() => {
    async function fetchProducts() {
      const supabase = createClient();
      const { data, error } = await supabase.rpc('get_products_with_significant_changes');
      
      if (error) {
        console.error('Error fetching price changes:', error);
      } else if (data) {
        setProducts(data);
      }
      setLoading(false);
    }

    fetchProducts();
  }, []);

  useEffect(() => {
    if (products.length <= 1) return;

    const interval = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % products.length);
    }, 5000); // Cambiar cada 5 segundos

    return () => clearInterval(interval);
  }, [products.length]);

  if (loading) {
    return <div className="h-64 bg-gray-100 animate-pulse rounded-lg"></div>;
  }

  if (products.length === 0) {
    return null; // No mostrar nada si no hay datos
  }

  const product = products[currentIndex];
  const isPriceUp = product.price_change_percentage > 0;

  return (
    <div className="bg-white rounded-lg shadow-lg overflow-hidden">
      <div className="p-4 border-b border-gray-100 flex justify-between items-center bg-gray-50">
        <h3 className="font-semibold text-gray-800">Cambios de Precio Recientes</h3>
        <div className="flex space-x-1">
          {products.map((_, idx) => (
            <button
              key={idx}
              onClick={() => setCurrentIndex(idx)}
              className={`w-2 h-2 rounded-full transition-colors ${
                idx === currentIndex ? 'bg-blue-600' : 'bg-gray-300'
              }`}
              aria-label={`Ver producto ${idx + 1}`}
            />
          ))}
        </div>
      </div>
      
      <div className="p-6 relative min-h-[200px]">
        <div className="flex flex-col md:flex-row items-center gap-6 transition-opacity duration-500 ease-in-out">
          {/* Imagen del producto */}
          <div className="w-full md:w-1/3 flex justify-center">
            {product.product_photo_url ? (
              <img 
                src={product.product_photo_url} 
                alt={product.product_name}
                className="h-40 w-40 object-cover rounded-lg shadow-sm border border-gray-200"
              />
            ) : (
              <div className="h-40 w-40 bg-gray-100 rounded-lg flex items-center justify-center text-gray-400">
                <svg className="w-12 h-12" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
              </div>
            )}
          </div>

          {/* Información del cambio */}
          <div className="w-full md:w-2/3 text-center md:text-left">
            <Link href={`/product/${product.product_id}`} className="text-xl font-bold text-gray-900 hover:text-blue-600 transition-colors">
              {product.product_name}
            </Link>
            
            <div className="mt-2 flex items-center justify-center md:justify-start gap-4">
              <div className="text-gray-500 line-through text-lg">
                ${product.previous_price.toFixed(2)}
              </div>
              <div className="text-gray-400">→</div>
              <div className="text-2xl font-bold text-gray-900">
                ${product.current_price.toFixed(2)}
              </div>
              <div className={`px-3 py-1 rounded-full text-sm font-bold ${
                isPriceUp ? 'bg-red-100 text-red-700' : 'bg-green-100 text-green-700'
              }`}>
                {isPriceUp ? '▲' : '▼'} {Math.abs(product.price_change_percentage).toFixed(1)}%
              </div>
            </div>

            <div className="mt-4 text-sm text-gray-600">
              <p>
                <span className="font-medium">Lugar:</span> {product.establishment_name} ({product.location_name})
              </p>
              <p>
                <span className="font-medium">Fecha:</span> {new Date(product.last_update_date).toLocaleDateString('es-ES', { year: 'numeric', month: 'long', day: 'numeric' })}
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
