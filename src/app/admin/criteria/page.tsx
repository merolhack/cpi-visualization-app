import { Metadata } from 'next';
import { createClient } from '@/app/lib/supabase/server';
import Link from 'next/link';

export const metadata: Metadata = {
  title: 'Gestión de Criterios - Admin IRPC',
  description: 'Administrar criterios de evaluación',
};

interface Criterion {
  criterion_id: number;
  criterion_name: string;
  criterion_description: string;
  is_active_criterion: boolean;
  acceptance_score: number;
}

export default async function AdminCriteriaPage() {
  const supabase = await createClient();

  const { data: criteria, error } = await supabase
    .from('cpi_criteria')
    .select('*')
    .order('criterion_id');

  if (error) {
    console.error('Error fetching criteria:', error);
  }

  return (
    <div className="p-8">
      <div className="mb-6 flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Criterios de Evaluación</h1>
          <p className="text-gray-600">Gestión de criterios para el cálculo del IRPC</p>
        </div>
        <Link 
          href="/admin/criteria/new"
          className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700"
        >
          Agregar Criterio
        </Link>
      </div>

      <div className="bg-white rounded-lg shadow overflow-hidden">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">ID</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Nombre</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Descripción</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Puntuación</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Estado</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {criteria && criteria.length > 0 ? (
              criteria.map((criterion: Criterion) => (
                <tr key={criterion.criterion_id}>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                    {criterion.criterion_id}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {criterion.criterion_name}
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-500 max-w-md truncate">
                    {criterion.criterion_description}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {criterion.acceptance_score}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                      criterion.is_active_criterion
                        ? 'bg-green-100 text-green-800'
                        : 'bg-gray-100 text-gray-800'
                    }`}>
                      {criterion.is_active_criterion ? 'Activo' : 'Inactivo'}
                    </span>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={5} className="px-6 py-12 text-center text-gray-500">
                  No se encontraron criterios
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
