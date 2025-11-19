import { Metadata } from 'next';
import { redirect } from 'next/navigation';
import { createClient } from '@/app/lib/supabase/server';
import Navbar from '@/app/_components/Navbar';
import HistoryTable from './HistoryTable';
import Link from 'next/link';

export const metadata: Metadata = {
  title: 'Historial - IRPC',
  description: 'Historial de movimientos y puntos',
};

export default async function HistorialPage() {
  const supabase = await createClient();

  const { data: { user }, error } = await supabase.auth.getUser();

  if (error || !user) {
    redirect('/auth/login?next=/dashboard/history');
  }

  // Obtener historial financiero
  const { data: historyData } = await supabase
    .rpc('get_volunteer_finance_history', { p_limit: 100 });

  return (
    <main className="min-h-screen bg-gray-50">
      <Navbar />

      <div className="container mx-auto max-w-4xl px-4 py-8">
        <div className="mb-6">
          <Link href="/dashboard" className="text-gray-500 hover:text-gray-700 text-sm mb-2 inline-flex items-center">
            <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
            Volver al panel
          </Link>
          <h1 className="text-2xl font-bold text-gray-900">Historial de Movimientos</h1>
          <p className="text-gray-600">
            Consulta tus últimos 100 movimientos de puntos y retiros.
          </p>
        </div>

        <HistoryTable initialData={historyData || []} />
      </div>
    </main>
  );
}
