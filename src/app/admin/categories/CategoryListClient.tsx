'use client';

import { useState } from 'react';
import { createClient } from '@/app/lib/supabase/client';
import { useRouter } from 'next/navigation';

interface Category {
  category_id: number;
  category_name: string;
  product_count: number;
}

export default function CategoryListClient({ initialCategories }: { initialCategories: Category[] }) {
  const [categories, setCategories] = useState<Category[]>(initialCategories);
  const [newCategoryName, setNewCategoryName] = useState('');
  const [isCreating, setIsCreating] = useState(false);
  const supabase = createClient();
  const router = useRouter();

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCategoryName.trim()) return;

    setIsCreating(true);
    try {
      const { data, error } = await supabase.rpc('create_category', {
        p_name: newCategoryName.trim()
      });

      if (error) throw error;

      // Optimistic update or refresh
      router.refresh();
      setNewCategoryName('');
      // We could add it to the list manually if we knew the ID, but refresh is safer
      // For now, let's just reload the page content via router.refresh()
      
      // Since we don't get the full object back easily without another query, we'll rely on refresh
      // But to show immediate feedback, we can fetch the list again or just wait for refresh
      
    } catch (error) {
      console.error('Error creating category:', error);
      alert('Error al crear la categoría');
    } finally {
      setIsCreating(false);
    }
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
      {/* Formulario de creación */}
      <div className="md:col-span-1">
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-lg font-semibold text-gray-800 mb-4">Nueva Categoría</h2>
          <form onSubmit={handleCreate}>
            <div className="mb-4">
              <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">
                Nombre
              </label>
              <input
                type="text"
                id="name"
                value={newCategoryName}
                onChange={(e) => setNewCategoryName(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Ej. Lácteos"
                required
              />
            </div>
            <button
              type="submit"
              disabled={isCreating || !newCategoryName.trim()}
              className="w-full bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors"
            >
              {isCreating ? 'Creando...' : 'Crear Categoría'}
            </button>
          </form>
        </div>
      </div>

      {/* Lista de categorías */}
      <div className="md:col-span-2">
        <div className="bg-white rounded-lg shadow overflow-hidden">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">ID</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Nombre</th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Productos</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {categories.length > 0 ? (
                categories.map((category) => (
                  <tr key={category.category_id}>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {category.category_id}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                      {category.category_name}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 text-right">
                      {category.product_count}
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={3} className="px-6 py-12 text-center text-gray-500">
                    No hay categorías registradas
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
