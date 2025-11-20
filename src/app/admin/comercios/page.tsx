import { Metadata } from 'next';
import { createClient } from '@/app/lib/supabase/server';
import AdminSidebar from '@/app/_components/AdminSidebar';
import EstablishmentListClient from './EstablishmentListClient';

export const metadata: Metadata = {
  title: 'Gestión de Comercios - Admin IRPC',
  description: 'Administrar comercios y establecimientos',
};

export default async function AdminEstablishmentsPage() {
  const supabase = await createClient();

  const { data: establishments, error } = await supabase.rpc('get_all_establishments_admin');

  if (error) {
    console.error('Error fetching establishments:', error);
  }

  return (
    <div className="flex min-h-screen bg-gray-100">
      <AdminSidebar />
      
      <div className="flex-1 p-8">
        <div className="mb-6 flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Comercios</h1>
            <p className="text-gray-600">Gestión de establecimientos comerciales</p>
          </div>
        </div>

        <EstablishmentListClient initialEstablishments={establishments || []} />
      </div>
    </div>
  );
}
