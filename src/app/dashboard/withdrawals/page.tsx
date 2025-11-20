import { Metadata } from 'next';
import { redirect } from 'next/navigation';
import { createClient } from '@/app/lib/supabase/server';
import Navbar from '@/app/_components/Navbar';
import Link from 'next/link';
import { revalidatePath } from 'next/cache';

export const metadata: Metadata = {
  title: 'Retiros - IRPC',
  description: 'Gestionar retiros de puntos',
};

export default async function RetirosPage() {
  const supabase = await createClient();

  const { data: { user }, error } = await supabase.auth.getUser();

  if (error || !user) {
    redirect('/auth/login?next=/dashboard/withdrawals');
  }

  // Obtener saldo actual
  const { data: balanceData } = await supabase
    .from('cpi_finances')
    .select('current_balance')
    .eq('user_id', user.id)
    .order('date', { ascending: false })
    .limit(1)
    .single();

  const currentBalance = balanceData?.current_balance || 0;

  // Obtener historial de retiros
  const { data: withdrawalHistory } = await supabase
    .rpc('get_withdrawal_history');

  async function requestWithdrawal(formData: FormData) {
    'use server';
    
    const supabase = await createClient();
    const amount = parseFloat(formData.get('amount') as string);
    const address = formData.get('address') as string;

    if (!amount || !address) return;

    const { error } = await supabase.rpc('request_withdrawal', {
      p_amount: amount,
      p_wallet_address: address
    });

    if (error) {
      console.error('Error requesting withdrawal:', error);
      // In a real app, we'd pass this error back to the UI
      return;
    }

    revalidatePath('/dashboard/withdrawals');
    revalidatePath('/dashboard');
  }

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
          <h1 className="text-2xl font-bold text-gray-900">Retiros</h1>
        </div>

        <div className="grid md:grid-cols-3 gap-8">
          {/* Columna Izquierda: Formulario y Saldo */}
          <div className="md:col-span-1 space-y-6">
            <div className="bg-gradient-to-br from-green-500 to-green-600 rounded-lg shadow-lg p-6 text-white">
              <h2 className="text-lg font-medium opacity-90 mb-1">Saldo Disponible</h2>
              <div className="text-4xl font-bold">{currentBalance}</div>
              <p className="text-sm mt-2 opacity-80">Puntos canjeables</p>
            </div>

            <div className="bg-white rounded-lg shadow-md p-6">
              <h2 className="text-lg font-semibold text-gray-800 mb-4">Solicitar Retiro</h2>
              <form action={requestWithdrawal} className="space-y-4">
                <div>
                  <label htmlFor="amount" className="block text-sm font-medium text-gray-700 mb-1">
                    Cantidad a retirar
                  </label>
                  <input
                    type="number"
                    name="amount"
                    id="amount"
                    min="1"
                    max={currentBalance}
                    required
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
                    placeholder="0"
                  />
                  <p className="text-xs text-gray-500 mt-1">Mínimo 1 punto</p>
                </div>

                <div>
                  <label htmlFor="address" className="block text-sm font-medium text-gray-700 mb-1">
                    Dirección Polygon (MATIC)
                  </label>
                  <input
                    type="text"
                    name="address"
                    id="address"
                    required
                    pattern="^0x[a-fA-F0-9]{40}$"
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
                    placeholder="0x..."
                  />
                  <p className="text-xs text-gray-500 mt-1">Asegúrate de que sea una dirección válida de Polygon</p>
                </div>

                <button
                  type="submit"
                  disabled={currentBalance < 1}
                  className="w-full bg-green-600 text-white py-2 px-4 rounded-md hover:bg-green-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors font-medium"
                >
                  Solicitar Retiro
                </button>
              </form>
            </div>
          </div>

          {/* Columna Derecha: Historial */}
          <div className="md:col-span-2">
            <div className="bg-white rounded-lg shadow-md overflow-hidden">
              <div className="px-6 py-4 border-b border-gray-200">
                <h2 className="text-lg font-semibold text-gray-800">Historial de Solicitudes</h2>
              </div>
              
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Fecha</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Concepto</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Monto</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Estado</th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {withdrawalHistory && withdrawalHistory.length > 0 ? (
                      withdrawalHistory.map((withdrawal: any) => (
                        <tr key={withdrawal.id}>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                            {new Date(withdrawal.created_at).toLocaleDateString()}
                          </td>
                          <td className="px-6 py-4 text-sm text-gray-900">
                            <div className="max-w-xs truncate" title="Retiro de puntos">
                              Retiro a billetera
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                            {withdrawal.amount_points} pts
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                              withdrawal.status === 'processed' 
                                ? 'bg-green-100 text-green-800' 
                                : 'bg-yellow-100 text-yellow-800'
                            }`}>
                              {withdrawal.status === 'pending' ? 'Pendiente' : 'Procesado'}
                            </span>
                          </td>
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td colSpan={4} className="px-6 py-12 text-center text-gray-500 text-sm">
                          No hay retiros registrados
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
