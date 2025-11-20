'use client';

import { useState, useEffect } from 'react';
import { createClient } from '@/app/lib/supabase/client';
import type { SupabaseClient } from '@supabase/supabase-js';

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

  // Cargar datos iniciales
  useEffect(() => {
    loadInitialData();
  }, []);

  // Cargar locations y establishments cuando se selecciona país
  useEffect(() => {
    if (formData.countryId) {
      loadLocations(formData.countryId);
      loadEstablishments(formData.countryId);
    }
  }, [formData.countryId]);

  const loadInitialData = async () => {
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
    } catch (err) {
      console.error('Error loading initial data:', err);
      setError('Error al cargar los datos iniciales');
    }
  };

    const loadLocations = async (countryId: string) => {
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
    } catch (err) {
      console.error('Error loading locations:', err);
      setError('Error al cargar los lugares');
    }
  };

  const loadEstablishments = async (countryId: string) => {
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
    } catch (err) {
      console.error('Error loading establishments:', err);
      setError('Error al cargar los establecimientos');
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validaciones
    if (!file.type.startsWith('image/')) {
      setError('Por favor selecciona un archivo de imagen válido');
      return;
    }
    
    if (file.size > 5 * 1024 * 1024) {
      setError('La imagen no debe superar los 5MB');
      return;
    }

    setImageFile(file);
    
    // Preview
    const reader = new FileReader();
    reader.onloadend = () => setImagePreview(reader.result as string);
    reader.readAsDataURL(file);
  };

  const uploadImage = async (file: File): Promise<string> => {
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
    } catch (err: any) {
      console.error('Error uploading image:', err);
      throw new Error(err.message || 'Error al subir la imagen');
    }
  };

  const handleSubmit = async () => {
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

    } catch (err: any) {
      console.error('Error submitting form:', err);
      setError(err.message || 'Error al guardar el producto');
    } finally {
      setLoading(false);
    }
  };

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
        {/* Campos del formulario... */}
        <div className="md:col-span-2">
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Nombre del Producto *
          </label>
          <input
            type="text"
            name="productName"
            value={formData.productName}
            onChange={handleInputChange}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="Ej: Leche entera 1L"
          />
        </div>

        <div className="md:col-span-2">
           {/* Placeholder for other fields if needed, but keeping it simple as per original */}
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