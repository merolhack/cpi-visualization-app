// src/app/page.tsx
import { createClient } from '@/app/lib/supabase/server';
import CpiChart from './_components/CpiChart';

export default async function HomePage() {
  const supabase = await createClient();
  const { data: cpiData, error } = await supabase
    .from('cpi_data')
    .select('period, value')
    .order('period', { ascending: true });

  if (error) {
    console.error('Error fetching CPI data:', error);
    return <main className="p-8"><p>Error loading data. Please try again later.</p></main>;
  }

  return (
    <main className="flex min-h-screen flex-col items-center justify-center p-8 bg-gray-50">
      <div className="w-full max-w-5xl bg-white p-6 rounded-lg shadow-md">
        <h1 className="text-2xl font-bold mb-4 text-center text-gray-800">
          Sistema de Índice Real de Precios al Consumidor (IRPC)
        </h1>
        <CpiChart data={cpiData ?? []} />
      </div>
    </main>
  );
}