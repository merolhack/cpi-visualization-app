'use client';

import { useState, useEffect, useCallback } from 'react';
import { createClient } from '@/app/lib/supabase/client';

interface FormData {
  productName: string;
  eanCode: string;
  countryId: string;
  categoryId: string;
  establishmentId: string;
  locationId: string;
  priceValue: string;
  priceDate: string;
}

interface SelectOption {
  id: string | number;
  name: string;
}

export default function AddProductForm() {
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  
  const [countries, setCountries] = useState<SelectOption[]>([]);
  const [categories, setCategories] = useState<SelectOption[]>([]);
  const [establishments, setEstablishments] = useState<SelectOption[]>([]);
  const [locations, setLocations] = useState<SelectOption[]>([]);
  
  const [formData, setFormData] = useState<FormData>({
    productName: '',
    eanCode: '',
    countryId: '',
    categoryId: '',
    establishmentId: '',
    locationId: '',
    priceValue: '',
    priceDate: new Date().toISOString().split('T')[0]
  });
  
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState('');

  const supabase = createClient();

  const loadInitialData = useCallback(async () => {
    try {
      const [countriesRes, categoriesRes] = await Promise.all([
        supabase.from('cpi_countries').select('country_id, country_name').order('country_name'),
        supabase.from('cpi_categories').select('category_id, category_name').order('category_name')
      ]);

      if (countriesRes.error) throw countriesRes.error;
      if (categoriesRes.error) throw categoriesRes.error;

      setCountries(
        countriesRes.data?.map((c: { country_id: number; country_name: string }) => ({
          id: c.country_id,
          name: c.country_name
        })) || []
      );
      
      setCategories(
        categoriesRes.data?.map((c: { category_id: number; category_name: string }) => ({
          id: c.category_id,
          name: c.category_name
        })) || []
      );
    } catch (err: unknown) {
      console.error('Error loading initial data:', err);
      setError('Error al cargar los datos iniciales');
    }
  }, [supabase]);

  const loadLocations = useCallback(async (countryId: string) => {
    try {
      const { data, error } = await supabase
        .from('cpi_locations')
        .select('location_id, location_name')
        .eq('country_id', countryId)
        .order('location_name');
      
      if (error) throw error;
      
      setLocations(
        data?.map((l: { location_id: number; location_name: string }) => ({
          id: l.location_id,
          name: l.location_name
        })) || []
      );
    } catch (err: unknown) {
      console.error('Error loading locations:', err);
      setError('Error al cargar los lugares');
    }
  }, [supabase]);

  const loadEstablishments = useCallback(async (countryId: string) => {
    try {
      const { data, error } = await supabase
        .from('cpi_establishments')
        .select('establishment_id, establishment_name')
        .eq('country_id', countryId)
        .order('establishment_name');
      
      if (error) throw error;
      
      setEstablishments(
        data?.map((e: { establishment_id: number; establishment_name: string }) => ({
          id: e.establishment_id,
          name: e.establishment_name
        })) || []
      );
    } catch (err: unknown) {
      console.error('Error loading establishments:', err);
      setError('Error al cargar los establecimientos');
    }
  }, [supabase]);

  // Cargar datos iniciales
  useEffect(() => {
    loadInitialData();
  }, [loadInitialData]);

  // Cargar locations y establishments cuando se selecciona país
  useEffect(() => {
    if (formData.countryId) {
      loadLocations(formData.countryId);
      loadEstablishments(formData.countryId);
    }
  }, [formData.countryId, loadLocations, loadEstablishments]);

  const handleInputChange = useCallback((e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  }, []);

  const validateImage = (file: File): string | null => {
    if (!file.type.startsWith('image/')) {
      return 'Por favor selecciona un archivo de imagen válido';
    }
    if (file.size > 5 * 1024 * 1024) {
      return 'La imagen no debe superar los 5MB';
    }
    return null;
  };

  const handleImageChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const validationError = validateImage(file);
    if (validationError) {
      setError(validationError);
      return;
    }

    setImageFile(file);
    
    // Preview
    const reader = new FileReader();
    reader.onloadend = () => setImagePreview(reader.result as string);
    reader.readAsDataURL(file);
  }, []);

  const uploadImage = useCallback(async (file: File): Promise<string> => {
    try {
      const formData = new FormData();
      formData.append('file', file);

      const { data: { session } } = await supabase.auth.getSession();
      
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_SUPABASE_URL}/functions/v1/validate-image`,
        {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${session?.access_token || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY}`,
          },
          body: formData,
        }
      );

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || 'Error al validar la imagen');
      }

      return result.url;
    } catch (err: unknown) {
      console.error('Error uploading image:', err);
      const message = err instanceof Error ? err.message : 'Error al subir la imagen';
      throw new Error(message);
    }
  }, [supabase]);

  const handleSubmit = useCallback(async () => {
    setLoading(true);
    setError(null);
    setSuccess(null);

    try {
      // Validación de campos
      const required = ['productName', 'eanCode', 'countryId', 'categoryId', 
                       'establishmentId', 'locationId', 'priceValue'];
      const missing = required.filter(field => !formData[field as keyof FormData]);
      
      if (missing.length > 0) {
        throw new Error(`Por favor completa todos los campos obligatorios: ${missing.join(', ')}`);
      }

      // Subir imagen
      let imageUrl: string | null = null;
      if (imageFile) {
        imageUrl = await uploadImage(imageFile);
      }

      // Llamar RPC
      const { data, error: rpcError } = await supabase.rpc('add_product_and_price', {
        p_product_name: formData.productName,
        p_ean_code: formData.eanCode,
        p_country_id: parseInt(formData.countryId),
        p_category_id: parseInt(formData.categoryId),
        p_establishment_id: parseInt(formData.establishmentId),
        p_location_id: parseInt(formData.locationId),
        p_price_value: parseFloat(formData.priceValue),
        p_price_date: formData.priceDate
      });

      if (rpcError) throw rpcError;

      // Actualizar imagen del producto si corresponde
      if (imageUrl && data && data[0]?.product_id) {
        await supabase
          .from('cpi_products')
          .update({ product_photo_url: imageUrl })
          .eq('product_id', data[0].product_id);
      }

      setSuccess('✓ Producto y precio agregados exitosamente');
      
      // Reset form
      setFormData({
        productName: '',
        eanCode: '',
        countryId: '',
        categoryId: '',
        establishmentId: '',
        locationId: '',
        priceValue: '',
        priceDate: new Date().toISOString().split('T')[0]
      });
      setImageFile(null);
      setImagePreview('');

      setTimeout(() => setSuccess(null), 5000);

    } catch (err: unknown) {
      console.error('Error submitting form:', err);
      // Capture the specific error message if available
      const message = err instanceof Error ? err.message : 'Error al guardar el producto';
      // If it's a PostgREST error object, it might be stringified or have details
      if (typeof err === 'object' && err !== null && 'details' in err) {
         setError(`Error detallado: ${(err as any).message || (err as any).details}`);
      } else {
         setError(message);
      }
    } finally {
      setLoading(false);
    }
  }, [formData, imageFile, supabase, uploadImage]);

  return (
    <div className="space-y-6">
      {success && (
        <div className="p-4 bg-green-100 border border-green-400 text-green-700 rounded-md">
          {success}
        </div>
      )}
      
      {error && (
        <div className="p-4 bg-red-100 border border-red-400 text-red-700 rounded-md">
          {error}
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="md:col-span-2">
          <label htmlFor="productName" className="block text-sm font-medium text-gray-700 mb-1">
            Nombre del Producto *
          </label>
          <input
            id="productName"
            type="text"
            name="productName"
            value={formData.productName}
            onChange={handleInputChange}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="Ej: Leche entera 1L"
          />
        </div>

        <div>
          <label htmlFor="eanCode" className="block text-sm font-medium text-gray-700 mb-1">
            Código EAN *
          </label>
          <input
            id="eanCode"
            type="text"
            name="eanCode"
            value={formData.eanCode}
            onChange={handleInputChange}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="Ej: 750100012345"
          />
        </div>

        <div>
          <label htmlFor="countryId" className="block text-sm font-medium text-gray-700 mb-1">
            País *
          </label>
          <select
            id="countryId"
            name="countryId"
            value={formData.countryId}
            onChange={handleInputChange}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="">Selecciona un país</option>
            {countries.map(c => (
              <option key={c.id} value={c.id}>{c.name}</option>
            ))}
          </select>
        </div>

        <div>
          <label htmlFor="categoryId" className="block text-sm font-medium text-gray-700 mb-1">
            Categoría *
          </label>
          <select
            id="categoryId"
            name="categoryId"
            value={formData.categoryId}
            onChange={handleInputChange}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="">Selecciona una categoría</option>
            {categories.map(c => (
              <option key={c.id} value={c.id}>{c.name}</option>
            ))}
          </select>
        </div>

        <div>
          <label htmlFor="establishmentId" className="block text-sm font-medium text-gray-700 mb-1">
            Establecimiento *
          </label>
          <select
            id="establishmentId"
            name="establishmentId"
            value={formData.establishmentId}
            onChange={handleInputChange}
            disabled={!formData.countryId}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-100"
          >
            <option value="">Selecciona un establecimiento</option>
            {establishments.map(e => (
              <option key={e.id} value={e.id}>{e.name}</option>
            ))}
          </select>
        </div>

        <div>
          <label htmlFor="locationId" className="block text-sm font-medium text-gray-700 mb-1">
            Ubicación (Sucursal) *
          </label>
          <select
            id="locationId"
            name="locationId"
            value={formData.locationId}
            onChange={handleInputChange}
            disabled={!formData.countryId}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-100"
          >
            <option value="">Selecciona una ubicación</option>
            {locations.map(l => (
              <option key={l.id} value={l.id}>{l.name}</option>
            ))}
          </select>
        </div>

        <div>
          <label htmlFor="priceValue" className="block text-sm font-medium text-gray-700 mb-1">
            Precio *
          </label>
          <div className="relative">
            <span className="absolute left-3 top-2 text-gray-500">$</span>
            <input
              id="priceValue"
              type="number"
              name="priceValue"
              value={formData.priceValue}
              onChange={handleInputChange}
              step="0.01"
              min="0"
              className="w-full pl-7 pr-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="0.00"
            />
          </div>
        </div>

        <div>
          <label htmlFor="priceDate" className="block text-sm font-medium text-gray-700 mb-1">
            Fecha del Precio *
          </label>
          <input
            id="priceDate"
            type="date"
            name="priceDate"
            value={formData.priceDate}
            onChange={handleInputChange}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        <div className="md:col-span-2">
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Foto del Producto / Precio (Opcional)
          </label>
          <input
            type="file"
            accept="image/*"
            onChange={handleImageChange}
            className="w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
          />
          {imagePreview && (
            <div className="mt-2">
              <img src={imagePreview} alt="Preview" className="h-32 object-cover rounded-md border" />
            </div>
          )}
          <p className="text-xs text-gray-500 mt-1">
            Formatos: JPG, PNG, WebP. Máximo 5MB.
          </p>
        </div>
        
        <button
          onClick={handleSubmit}
          disabled={loading}
          className="md:col-span-2 w-full bg-blue-600 text-white py-3 px-4 rounded-md hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed font-medium transition-colors"
        >
          {loading ? 'Guardando...' : 'Agregar Producto'}
        </button>
      </div>
    </div>
  );
}