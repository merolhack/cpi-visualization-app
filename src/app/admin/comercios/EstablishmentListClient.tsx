'use client';

import { useState } from 'react';

interface Establishment {
  id: number;
  name: string;
  country_name: string;
  location_count: number;
}

export default function EstablishmentListClient({ initialEstablishments }: { initialEstablishments: Establishment[] }) {
  const [establishments] = useState<Establishment[]>(initialEstablishments);

  return (
    <div className="bg-white rounded-lg shadow overflow-hidden">
      <table className="min-w-full divide-y divide-gray-200">
        <thead className="bg-gray-50">
          <tr>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">ID</th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Nombre</th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">País</th>
            <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Ubicaciones</th>
          </tr>
        </thead>
        <tbody className="bg-white divide-y divide-gray-200">
          {establishments.length > 0 ? (
            establishments.map((establishment) => (
              <tr key={establishment.id}>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {establishment.id}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                  {establishment.name}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {establishment.country_name}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 text-right">
                  {establishment.location_count}
                </td>
              </tr>
            ))
          ) : (
            <tr>
              <td colSpan={4} className="px-6 py-12 text-center text-gray-500">
                No hay comercios registrados
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
}
