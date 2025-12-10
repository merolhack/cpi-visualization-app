import { Metadata } from 'next';
import { createClient } from '@/app/lib/supabase/server';

export const metadata: Metadata = {
  title: 'Gestión de Voluntarios - Admin IRPC',
  description: 'Administrar voluntarios registrados',
};

export default async function AdminVolunteersPage() {
  const supabase = await createClient();

  const { data: volunteers, error } = await supabase.rpc('get_volunteers');

  if (error) {
    console.error('Error fetching volunteers:', error);
  }

  return (
    <div className="p-8">
      <div className="mb-6 flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Voluntarios</h1>
          <p className="text-gray-600">Gestión de usuarios colaboradores</p>
        </div>
      </div>

      <div className="bg-white rounded-lg shadow overflow-hidden">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">ID Usuario</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Productos Seguidos</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Puntos Totales</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Última Actividad</th>
              <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Acciones</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {volunteers && volunteers.length > 0 ? (
              volunteers.map((volunteer: { user_id: string; products_tracked: number; total_points: number; last_active: string | null }) => (
                <tr key={volunteer.user_id}>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                    <span className="font-mono text-xs bg-gray-100 px-2 py-1 rounded">
                      {volunteer.user_id.substring(0, 8)}...
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {volunteer.products_tracked}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-green-100 text-green-800">
                      {volunteer.total_points} pts
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {volunteer.last_active ? new Date(volunteer.last_active).toLocaleDateString() : 'N/A'}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                    <button className="text-indigo-600 hover:text-indigo-900 mr-4">Ver Detalles</button>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={5} className="px-6 py-12 text-center text-gray-500">
                  No se encontraron voluntarios activos
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
