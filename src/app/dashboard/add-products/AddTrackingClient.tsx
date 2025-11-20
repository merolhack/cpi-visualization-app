'use client';

import { useState, useEffect } from 'react';
import { createClient } from '@/app/lib/supabase/client';
import Link from 'next/link';

interface SelectOption {
  id: number;
  name: string;
}

interface Product {
  product_id: number;
  product_name: string;
  category_name: string;
  branch_name: string;
  product_photo_url: string | null;
  already_tracking: boolean;
}

export default function AddTrackingClient() {
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const [countries, setCountries] = useState<SelectOption[]>([]);
  const [establishments, setEstablishments] = useState<SelectOption[]>([]);
  const [locations, setLocations] = useState<SelectOption[]>([]);

  const [selectedCountry, setSelectedCountry] = useState<string>('');
  const [selectedLocation, setSelectedLocation] = useState<string>('');
  const [selectedEstablishment, setSelectedEstablishment] = useState<string>('');

  const [products, setProducts] = useState<Product[]>([]);
  const [selectedProducts, setSelectedProducts] = useState<number[]>([]);
  const [searching, setSearching] = useState(false);

  const supabase = createClient();

  useEffect(() => {
    loadCountries();
  }, []);

  useEffect(() => {
    if (selectedCountry) {
      loadLocations(selectedCountry);
      loadEstablishments(selectedCountry);
      setProducts([]);
      setSelectedProducts([]);
    } else {
      setLocations([]);
      setEstablishments([]);
    }
  }, [selectedCountry]);

  const loadCountries = async () => {
    const { data, error } = await supabase
      .from('cpi_countries')
      .select('country_id, country_name')
      .order('country_name');
    
    if (error) console.error('Error loading countries:', error);
    else setCountries(data?.map((c: { country_id: number; country_name: string }) => ({ id: c.country_id, name: c.country_name })) || []);
  };

  const loadLocations = async (countryId: string) => {
    const { data, error } = await supabase
      .from('cpi_locations')
      .select('location_id, location_name')
      .eq('country_id', countryId)
      .order('location_name');

    if (error) console.error('Error loading locations:', error);
    else setLocations(data?.map((l: { location_id: number; location_name: string }) => ({ id: l.location_id, name: l.location_name })) || []);
  };

  const loadEstablishments = async (countryId: string) => {
    const { data, error } = await supabase
      .from('cpi_establishments')
      .select('establishment_id, establishment_name')
      .eq('country_id', countryId)
      .order('establishment_name');

    if (error) console.error('Error loading establishments:', error);
    else setEstablishments(data?.map((e: { establishment_id: number; establishment_name: string }) => ({ id: e.establishment_id, name: e.establishment_name })) || []);
  };

  const searchProducts = async () => {
    if (!selectedCountry || !selectedLocation || !selectedEstablishment) {
      setError('Por favor selecciona país, lugar y comercio');
      return;
    }

    setSearching(true);
    setError(null);
    setProducts([]);

    try {
      const { data, error } = await supabase.rpc('get_available_products_for_tracking', {
        p_country_id: parseInt(selectedCountry),
        p_location_id: parseInt(selectedLocation),
        p_establishment_id: parseInt(selectedEstablishment)
      });

      if (error) throw error;
      setProducts(data || []);
    } catch (err: any) {
      console.error('Error searching products:', err);
      setError(err.message);
    } finally {
      setSearching(false);
    }
  };

  const toggleProduct = (productId: number) => {
    setSelectedProducts(prev => 
      prev.includes(productId) 
        ? prev.filter(id => id !== productId)
        : [...prev, productId]
    );
  };

  const handleSave = async () => {
    if (selectedProducts.length === 0) return;

    setLoading(true);
    setError(null);
    setSuccess(null);

    try {
      const { data, error } = await supabase.rpc('add_products_to_tracking', {
        p_product_ids: selectedProducts,
        p_country_id: parseInt(selectedCountry),
        p_location_id: parseInt(selectedLocation),
        p_establishment_id: parseInt(selectedEstablishment)
      });

      if (error) throw error;

      setSuccess(`¡Éxito! Se agregaron ${selectedProducts.length} productos a tu lista.`);
      setSelectedProducts([]);
      // Refresh list to update 'already_tracking' status
      searchProducts();
    } catch (err: any) {
      console.error('Error saving tracking:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-8">
      <div className="bg-white p-6 rounded-lg shadow-md">
        <h2 className="text-lg font-semibold mb-4">1. Selecciona la ubicación</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">País</label>
            <select
              value={selectedCountry}
              onChange={(e) => setSelectedCountry(e.target.value)}
              className="w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="">Selecciona un país</option>
              {countries.map(c => (
                <option key={c.id} value={c.id}>{c.name}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Lugar / Ciudad</label>
            <select
              value={selectedLocation}
              onChange={(e) => setSelectedLocation(e.target.value)}
              disabled={!selectedCountry}
              className="w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 disabled:bg-gray-100"
            >
              <option value="">Selecciona un lugar</option>
              {locations.map(l => (
                <option key={l.id} value={l.id}>{l.name}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Comercio</label>
            <select
              value={selectedEstablishment}
              onChange={(e) => setSelectedEstablishment(e.target.value)}
              disabled={!selectedCountry}
              className="w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 disabled:bg-gray-100"
            >
              <option value="">Selecciona un comercio</option>
              {establishments.map(e => (
                <option key={e.id} value={e.id}>{e.name}</option>
              ))}
            </select>
          </div>
        </div>

        <div className="mt-4 flex justify-end">
          <button
            onClick={searchProducts}
            disabled={!selectedCountry || !selectedLocation || !selectedEstablishment || searching}
            className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 disabled:bg-gray-400 transition-colors"
          >
            {searching ? 'Buscando...' : 'Buscar Productos Disponibles'}
          </button>
        </div>
      </div>

      {error && (
        <div className="bg-red-50 border-l-4 border-red-400 p-4">
          <div className="flex">
            <div className="flex-shrink-0">
              <svg className="h-5 w-5 text-red-400" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
              </svg>
            </div>
            <div className="ml-3">
              <p className="text-sm text-red-700">{error}</p>
            </div>
          </div>
        </div>
      )}

      {success && (
        <div className="bg-green-50 border-l-4 border-green-400 p-4">
          <div className="flex">
            <div className="flex-shrink-0">
              <svg className="h-5 w-5 text-green-400" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
              </svg>
            </div>
            <div className="ml-3">
              <p className="text-sm text-green-700">{success}</p>
            </div>
          </div>
        </div>
      )}

      {products.length > 0 && (
        <div className="bg-white rounded-lg shadow-md overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-200 flex justify-between items-center">
            <h2 className="text-lg font-semibold">2. Selecciona los productos a seguir</h2>
            <span className="text-sm text-gray-500">{selectedProducts.length} seleccionados</span>
          </div>
          
          <div className="divide-y divide-gray-200 max-h-[600px] overflow-y-auto">
            {products.map((product) => (
              <div 
                key={product.product_id} 
                className={`p-4 flex items-center hover:bg-gray-50 transition-colors ${product.already_tracking ? 'opacity-50 bg-gray-50' : ''}`}
              >
                <div className="flex-shrink-0 mr-4">
                  <input
                    type="checkbox"
                    checked={selectedProducts.includes(product.product_id) || product.already_tracking}
                    onChange={() => toggleProduct(product.product_id)}
                    disabled={product.already_tracking}
                    className="h-5 w-5 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                  />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between">
                    <p className="text-sm font-medium text-gray-900 truncate">
                      {product.product_name}
                    </p>
                    {product.already_tracking && (
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                        Ya siguiendo
                      </span>
                    )}
                  </div>
                  <p className="text-sm text-gray-500">
                    {product.category_name} • {product.branch_name}
                  </p>
                </div>
              </div>
            ))}
          </div>

          <div className="px-6 py-4 bg-gray-50 border-t border-gray-200 flex justify-end">
            <button
              onClick={handleSave}
              disabled={selectedProducts.length === 0 || loading}
              className="bg-blue-600 text-white px-6 py-2 rounded-md hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors font-medium shadow-sm"
            >
              {loading ? 'Guardando...' : `Agregar ${selectedProducts.length} Productos`}
            </button>
          </div>
        </div>
      )}

      {products.length === 0 && searching === false && selectedCountry && selectedLocation && selectedEstablishment && (
        <div className="text-center py-12 bg-white rounded-lg border border-dashed border-gray-300">
          <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <h3 className="mt-2 text-sm font-medium text-gray-900">No se encontraron productos</h3>
          <p className="mt-1 text-sm text-gray-500">No hay productos disponibles para esta combinación.</p>
        </div>
      )}
    </div>
  );
}
