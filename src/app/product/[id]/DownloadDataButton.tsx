'use client';

import React from 'react';

interface PriceData {
  date: string;
  price_value: number;
  establishment_name: string;
  location_name: string;
}

export default function DownloadDataButton({ data, productName }: { data: any[], productName: string }) {
  const handleDownload = () => {
    if (!data || data.length === 0) return;

    const headers = ['Fecha', 'Precio', 'Comercio', 'Lugar'];
    const csvContent = [
      headers.join(','),
      ...data.map(row => [
        new Date(row.date).toISOString().split('T')[0],
        row.price_value,
        `"${(row.cpi_establishments as any)?.establishment_name || ''}"`,
        `"${(row.cpi_locations as any)?.location_name || ''}"`
      ].join(','))
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', `precios_${productName.replace(/\s+/g, '_').toLowerCase()}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <button 
      onClick={handleDownload}
      className="px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-md hover:bg-blue-700 transition-colors flex items-center"
    >
      <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
      </svg>
      Descargar Datos
    </button>
  );
}
