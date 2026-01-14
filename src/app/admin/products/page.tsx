import { Metadata } from 'next';
import { createClient } from '@/app/lib/supabase/server';
import ProductListClient from './ProductListClient';

export const metadata: Metadata = {
  title: 'Gestión de Productos - Admin IRPC',
  description: 'Administrar catálogo de productos',
};

export default async function AdminProductsPage() {
  const supabase = await createClient();

  const { data: products, error } = await supabase.rpc('get_all_products_admin', {
    p_search: null,
    p_limit: 100,
    p_offset: 0
  });

  if (error) {
    console.error('Error fetching products:', error);
  }

  return (
    <div className="p-8">
      <div className="mb-6 flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Productos</h1>
          <p className="text-gray-600">Gestión del catálogo de productos</p>
        </div>
        <button className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700">
          Agregar Producto
        </button>
      </div>

      <ProductListClient initialProducts={products || []} />
    </div>
  );
}
