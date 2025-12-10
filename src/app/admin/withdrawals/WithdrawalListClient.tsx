'use client';

import { useState } from 'react';
import { createClient } from '@/app/lib/supabase/client';
import { useRouter } from 'next/navigation';

interface Withdrawal {
  id: string;
  user_id: string;
  amount_points: number;
  wallet_address: string;
  created_at: string;
}

export default function WithdrawalListClient({ initialWithdrawals }: { initialWithdrawals: Withdrawal[] }) {
  const [withdrawals, setWithdrawals] = useState<Withdrawal[]>(initialWithdrawals);
  const [processingId, setProcessingId] = useState<string | null>(null);
  const supabase = createClient();
  const router = useRouter();

  const processWithdrawal = async (id: string, status: 'processed' | 'rejected') => {
    if (!confirm(`¿Estás seguro de que deseas marcar este retiro como ${status === 'processed' ? 'PROCESADO' : 'RECHAZADO'}?`)) {
      return;
    }

    setProcessingId(id);
    try {
      const { error } = await supabase.rpc('process_withdrawal', {
        p_withdrawal_id: id,
        p_status: status
      });

      if (error) throw error;

      setWithdrawals(withdrawals.filter(w => w.id !== id));
      router.refresh();
    } catch (error) {
      console.error('Error processing withdrawal:', error);
      alert('Error al procesar el retiro');
    } finally {
      setProcessingId(null);
    }
  };

  return (
    <div className="bg-white rounded-lg shadow overflow-hidden">
      <table className="min-w-full divide-y divide-gray-200">
        <thead className="bg-gray-50">
          <tr>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Fecha</th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Usuario</th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Monto</th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Billetera</th>
            <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Acciones</th>
          </tr>
        </thead>
        <tbody className="bg-white divide-y divide-gray-200">
          {withdrawals.length > 0 ? (
            withdrawals.map((withdrawal) => (
              <tr key={withdrawal.id}>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {new Date(withdrawal.created_at).toLocaleDateString()}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                  {withdrawal.user_id.substring(0, 8)}...
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                  {withdrawal.amount_points} pts
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm font-mono text-gray-500">
                  {withdrawal.wallet_address}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                  <button
                    onClick={() => processWithdrawal(withdrawal.id, 'processed')}
                    disabled={processingId === withdrawal.id}
                    className="text-green-600 hover:text-green-900 mr-4 disabled:opacity-50"
                  >
                    Aprobar
                  </button>
                  <button
                    onClick={() => processWithdrawal(withdrawal.id, 'rejected')}
                    disabled={processingId === withdrawal.id}
                    className="text-red-600 hover:text-red-900 disabled:opacity-50"
                  >
                    Rechazar
                  </button>
                </td>
              </tr>
            ))
          ) : (
            <tr>
              <td colSpan={5} className="px-6 py-12 text-center text-gray-500">
                No hay retiros pendientes
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
}
