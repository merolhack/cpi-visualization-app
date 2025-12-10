import { Metadata } from 'next';
import { createClient } from '@/app/lib/supabase/server';
import CategoryListClient from './CategoryListClient';

export const metadata: Metadata = {
  title: 'Gestión de Categorías - Admin IRPC',
  description: 'Administrar categorías de productos',
};

export default async function AdminCategoriesPage() {
  const supabase = await createClient();

  const { data: categories, error } = await supabase.rpc('get_all_categories_admin');

  if (error) {
    console.error('Error fetching categories:', error);
  }

  return (
    <div className="p-8">
      <div className="mb-6 flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Categorías</h1>
          <p className="text-gray-600">Gestión de categorías de productos</p>
        </div>
      </div>

      <CategoryListClient initialCategories={categories || []} />
    </div>
  );
}
