// src/app/page.tsx
import { createClient } from '@/app/lib/supabase/server';
import { headers } from 'next/headers';
import CpiChart from '@/app/_components/CpiChart';
import CountrySelector from '@/app/_components/CountrySelector';
import ProductPriceComparisonChart from '@/app/_components/ProductPriceComparisonChart';
import Navbar from '@/app/_components/Navbar';

export const dynamic = 'force-dynamic';

export default async function HomePage({ 
  searchParams 
}: { 
  searchParams: Promise<{ [key: string]: string | undefined }> 
}) {
  const resolvedSearchParams = await searchParams;
  headers();

  const supabase = await createClient();

  const { data: countries, error: countriesError } = await supabase
    .from('cpi_countries')
    .select('country_id, country_name');

  const selectedCountryId = resolvedSearchParams?.countryId ?? '1';
  const selectedCountry = countries?.find(c => c.country_id.toString() === selectedCountryId);

  // Obtener datos de inflación
  let mainCpiValue: number | null = null;
  let chartData: { period: string, value: number }[] = [];

  if (selectedCountry) {
    const { data: inflationData } = await supabase
      .from('cpi_real_cpi')
      .select('year, month, real_cpi_inflation_rate')
      .eq('country_id', selectedCountry.country_id)
      .order('year', { ascending: false })
      .order('month', { ascending: false })
      .limit(1);

    if (inflationData && inflationData.length > 0) {
      mainCpiValue = inflationData[0].real_cpi_inflation_rate;
      
      const { data: historicalInflationData } = await supabase
        .from('cpi_real_cpi')
        .select('year, month, real_cpi_inflation_rate')
        .eq('country_id', selectedCountry.country_id)
        .order('year', { ascending: false })
        .order('month', { ascending: false })
        .limit(36);

      if (historicalInflationData) {
        chartData = historicalInflationData.map(d => ({
          period: `${d.year}-${String(d.month).padStart(2, '0')}-01`,
          value: d.real_cpi_inflation_rate ?? 0
        })).reverse();
      }
    }
  }

  // Obtener datos de comparación de precios
  const { data: priceComparisonData } = await supabase.rpc('get_latest_prices_by_country', {
    p_country_id: parseInt(selectedCountryId)
  });

  return (
    <main className="min-h-screen bg-gray-50">
      <Navbar />
      
      <div className="container mx-auto px-4 py-8">
        <header className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            Índice Real de Precios al Consumidor
          </h1>
          <p className="text-xl text-gray-600">
            Datos actualizados por voluntarios en tiempo real
          </p>
        </header>

        {/* Selector de país */}
        <section className="mb-8">
          {countries && (
            <CountrySelector 
              countries={countries} 
              selectedCountryId={selectedCountryId} 
            />
          )}
        </section>

        {/* Tarjeta con valor principal */}
        {selectedCountry && (
          <section className="mb-12">
            <div className="bg-white rounded-lg shadow-lg p-8 text-center">
              <h2 className="text-2xl font-semibold text-gray-700 mb-2">
                {selectedCountry.country_name}
              </h2>
              <p className="text-5xl font-bold text-blue-600">
                {mainCpiValue !== null ? `${mainCpiValue.toFixed(2)}%` : '—'}
              </p>
              <p className="text-gray-600 mt-2">Inflación anual</p>
            </div>
          </section>
        )}

        {/* Gráfica de inflación */}
        <section className="mb-12">
          <h2 className="text-2xl font-semibold mb-6 text-gray-800">
            Evolución de la Inflación (últimos 36 meses)
          </h2>
          <div className="bg-white rounded-lg shadow-lg p-6">
            {chartData.length > 0 ? (
              <CpiChart data={chartData} />
            ) : (
              <p className="text-gray-500 text-center py-16">
                Los datos de inflación para este país se están procesando.
              </p>
            )}
          </div>
        </section>

        {/* Gráfica de comparación de precios */}
        <section className="mb-12">
          <h2 className="text-2xl font-semibold mb-6 text-gray-800">
            Comparación de Precios por Comercio
          </h2>
          <div className="bg-white rounded-lg shadow-lg p-6">
            {priceComparisonData && priceComparisonData.length > 0 ? (
              <ProductPriceComparisonChart data={priceComparisonData as any} />
            ) : (
              <div className="text-center text-gray-500 py-16">
                <p>No hay datos de precios disponibles para comparar en este país.</p>
                <p className="text-sm mt-2">
                  Los voluntarios pueden empezar a subir precios para activar esta gráfica.
                </p>
              </div>
            )}
          </div>
        </section>

        {/* Llamado a la acción */}
        <section className="bg-blue-50 rounded-lg p-8 text-center">
          <h3 className="text-2xl font-bold text-gray-800 mb-4">
            ¿Quieres contribuir?
          </h3>
          <p className="text-gray-600 mb-6">
            Únete como voluntario y ayuda a mantener datos precisos de precios al consumidor.
          </p>
          <a
            href="/auth/register"
            className="inline-block px-6 py-3 bg-green-600 text-white font-medium rounded-md hover:bg-green-700 transition-colors"
          >
            Registrarse como Voluntario
          </a>
        </section>
      </div>
    </main>
  );
}