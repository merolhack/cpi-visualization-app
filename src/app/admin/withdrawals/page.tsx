import { Metadata } from 'next';
import { createClient } from '@/app/lib/supabase/server';
import WithdrawalListClient from './WithdrawalListClient';

export const metadata: Metadata = {
  title: 'Gestión de Retiros - Admin IRPC',
  description: 'Procesar solicitudes de retiro',
};

export default async function AdminWithdrawalsPage() {
  const supabase = await createClient();

  const { data: withdrawals, error } = await supabase.rpc('get_pending_withdrawals');

  if (error) {
    console.error('Error fetching withdrawals:', error);
  }

  return (
    <div className="p-8">
      <div className="mb-6 flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Retiros Pendientes</h1>
          <p className="text-gray-600">Solicitudes de retiro de puntos por procesar</p>
        </div>
      </div>

      <WithdrawalListClient initialWithdrawals={withdrawals || []} />
    </div>
  );
}
