'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { createClient } from '@/app/lib/supabase/client';

export default function AddCriterionPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [formData, setFormData] = useState({
    criterion_name: '',
    criterion_description: '',
    acceptance_score: 1,
    is_active_criterion: true,
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    const supabase = createClient();

    const { error: insertError } = await supabase
      .from('cpi_criteria')
      .insert({
        criterion_name: formData.criterion_name,
        criterion_description: formData.criterion_description,
        acceptance_score: formData.acceptance_score,
        is_active_criterion: formData.is_active_criterion,
      });

    if (insertError) {
      console.error('Error creating criterion:', insertError);
      setError('Error al crear el criterio. Por favor intenta de nuevo.');
      setLoading(false);
      return;
    }

    router.push('/admin/criteria');
    router.refresh();
  };

  return (
    <div className="p-8 max-w-2xl">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Agregar Criterio</h1>
        <p className="text-gray-600">Crear un nuevo criterio de evaluación para el IRPC</p>
      </div>

      {error && (
        <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-md text-red-700">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="bg-white rounded-lg shadow-md p-6 space-y-6">
        <div>
          <label htmlFor="criterion_name" className="block text-sm font-medium text-gray-700 mb-1">
            Nombre del Criterio *
          </label>
          <input
            type="text"
            id="criterion_name"
            required
            value={formData.criterion_name}
            onChange={(e) => setFormData({ ...formData, criterion_name: e.target.value })}
            className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            placeholder="Ej: IRPC Básico"
          />
        </div>

        <div>
          <label htmlFor="criterion_description" className="block text-sm font-medium text-gray-700 mb-1">
            Descripción *
          </label>
          <textarea
            id="criterion_description"
            required
            rows={4}
            value={formData.criterion_description}
            onChange={(e) => setFormData({ ...formData, criterion_description: e.target.value })}
            className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            placeholder="Describe el criterio de evaluación..."
          />
        </div>

        <div>
          <label htmlFor="acceptance_score" className="block text-sm font-medium text-gray-700 mb-1">
            Puntuación de Aceptación *
          </label>
          <input
            type="number"
            id="acceptance_score"
            required
            min="0"
            step="0.01"
            value={formData.acceptance_score}
            onChange={(e) => setFormData({ ...formData, acceptance_score: parseFloat(e.target.value) })}
            className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          />
          <p className="mt-1 text-sm text-gray-500">Valor numérico para la ponderación del criterio</p>
        </div>

        <div className="flex items-center">
          <input
            type="checkbox"
            id="is_active_criterion"
            checked={formData.is_active_criterion}
            onChange={(e) => setFormData({ ...formData, is_active_criterion: e.target.checked })}
            className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
          />
          <label htmlFor="is_active_criterion" className="ml-2 block text-sm text-gray-900">
            Criterio activo
          </label>
        </div>

        <div className="flex gap-4 pt-4">
          <button
            type="submit"
            disabled={loading}
            className="flex-1 bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 disabled:bg-blue-300 disabled:cursor-not-allowed"
          >
            {loading ? 'Guardando...' : 'Guardar Criterio'}
          </button>
          <button
            type="button"
            onClick={() => router.push('/admin/criteria')}
            className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
          >
            Cancelar
          </button>
        </div>
      </form>
    </div>
  );
}
