'use client';

import { useState } from 'react';

interface FinanceRecord {
  finance_id: number;
  concept: string;
  date: string;
  amount: number;
  current_balance: number;
}

export default function HistoryTable({ initialData }: { initialData: FinanceRecord[] }) {
  const [data] = useState<FinanceRecord[]>(initialData);

  const downloadCSV = () => {
    if (!data || data.length === 0) return;

    const headers = ['ID', 'Fecha', 'Concepto', 'Monto', 'Saldo'];
    const csvContent = [
      headers.join(','),
      ...data.map(row => [
        row.finance_id,
        new Date(row.date).toISOString(),
        `"${row.concept.replace(/"/g, '""')}"`, // Escape quotes
        row.amount,
        row.current_balance
      ].join(','))
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', `historial_irpc_${new Date().toISOString().split('T')[0]}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="bg-white rounded-lg shadow-md overflow-hidden">
      <div className="px-6 py-4 border-b border-gray-200 flex justify-between items-center">
        <h2 className="text-lg font-semibold text-gray-800">Movimientos Recientes</h2>
        <button
          onClick={downloadCSV}
          disabled={data.length === 0}
          className="inline-flex items-center px-3 py-2 border border-gray-300 shadow-sm text-sm leading-4 font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50"
        >
          <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
          </svg>
          Exportar CSV
        </button>
      </div>
      
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Fecha</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Concepto</th>
              <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Monto</th>
              <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Saldo</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {data.length > 0 ? (
              data.map((record) => (
                <tr key={record.finance_id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {new Date(record.date).toLocaleDateString()} <span className="text-xs text-gray-400">{new Date(record.date).toLocaleTimeString()}</span>
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-900">
                    {record.concept}
                  </td>
                  <td className={`px-6 py-4 whitespace-nowrap text-sm font-medium text-right ${record.amount >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                    {record.amount > 0 ? '+' : ''}{record.amount}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 text-right">
                    {record.current_balance}
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={4} className="px-6 py-12 text-center text-gray-500 text-sm">
                  No hay movimientos registrados
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
