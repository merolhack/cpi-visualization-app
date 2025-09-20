// file: src/app/page.tsx
import { createClient } from '@/app/lib/supabase/server';
import { headers } from 'next/headers'; // <-- PASO 1: Importar 'headers'
import CpiChart from './_components/CpiChart';
import CountrySelector from './_components/CountrySelector';
import ProductPriceComparisonChart from './_components/ProductPriceComparisonChart';

export const dynamic = 'force-dynamic';

// Tipos de datos (se mantienen igual)
type InflationDataPoint = { year: number; month: number; real_cpi_inflation_rate: number | null };
type PriceComparisonData = { product_name: string; establishment_name: string; price_value: number };

export default async function HomePage({ searchParams }: { searchParams: Promise<{ [key: string]: string | undefined }> }) {
  // Await searchParams before using it
  const resolvedSearchParams = await searchParams;
  headers(); // <-- PASO 2: Llamar a la función headers()

  const supabase = await createClient();

  // --- 1. GESTIÓN DEL PAÍS SELECCIONADO ---
  const { data: countries, error: countriesError } = await supabase.from('cpi_countries').select('country_id, country_name');
  if (countriesError) console.error("Error fetching countries:", countriesError);
  
  // Use resolvedSearchParams instead of searchParams
  const selectedCountryId = resolvedSearchParams?.countryId ?? '1';
  const selectedCountry = countries?.find(c => c.country_id.toString() === selectedCountryId);

  // --- 2. OBTENCIÓN DE DATOS PARA LA GRÁFICA PRINCIPAL (INFLACIÓN) ---
  let mainCpiValue: number | null = null;
  let chartData: { period: string, value: number }[] = [];

  if (selectedCountry) {
    const { data: inflationData, error: inflationError } = await supabase
      .from('cpi_real_cpi')
      .select('year, month, real_cpi_inflation_rate')
      .eq('country_id', selectedCountry.country_id)
      .order('year', { ascending: false }).order('month', { ascending: false }).limit(1);

    if (inflationError) console.error('Error fetching inflation data:', inflationError);
    else if (inflationData && inflationData.length > 0) {
      mainCpiValue = inflationData[0].real_cpi_inflation_rate;
      
      const { data: historicalInflationData } = await supabase
        .from('cpi_real_cpi')
        .select('year, month, real_cpi_inflation_rate')
        .eq('country_id', selectedCountry.country_id)
        .order('year', { ascending: false }).order('month', { ascending: false }).limit(36);

      if (historicalInflationData) {
        chartData = historicalInflationData.map(d => ({
          period: `${d.year}-${String(d.month).padStart(2, '0')}-01`,
          value: d.real_cpi_inflation_rate ?? 0
        })).reverse();
      }
    }
  }
  
  // --- 3. OBTENCIÓN DE DATOS PARA LA NUEVA GRÁFICA (COMPARACIÓN DE PRECIOS) ---
  console.log(`[DEBUG] Invocando RPC 'get_latest_prices_by_country' para el país con ID: ${selectedCountryId}`);
  const { data: priceComparisonData, error: rpcError } = await supabase.rpc('get_latest_prices_by_country', {
    p_country_id: parseInt(selectedCountryId)
  });
  if (rpcError) {
    console.error("[DEBUG] Error al invocar la función RPC:", JSON.stringify(rpcError, null, 2));
  } else {
    console.log("[DEBUG] Datos recibidos de la función RPC:", priceComparisonData);
    console.log(`[DEBUG] Número de registros recibidos: ${priceComparisonData?.length ?? 0}`);
  }

  return (
    <main className="flex min-h-screen flex-col items-center p-4 sm:p-8 bg-gray-100">
      <div className="w-full max-w-6xl space-y-12">
        {/* ... (Tu JSX se mantiene igual que en el archivo project-code.txt) ... */}
        {/* SECCIÓN 1: TÍTULO Y SELECTOR DE PAÍS */}
        <div className="text-center bg-white p-6 rounded-lg shadow-lg">
          <h1 className="text-2xl sm:text-3xl font-bold mb-2 text-gray-800">
            Índice Real de Precios al Consumidor
          </h1>
          {countries && <CountrySelector countries={countries} selectedCountryId={selectedCountryId} />}
          <p className="text-xl sm:text-2xl text-blue-600 font-semibold">
            {selectedCountry?.country_name}: {mainCpiValue !== null ? `${mainCpiValue.toFixed(2)}% anual` : 'Calculando datos...'}
          </p>
        </div>

        {/* SECCIÓN 2: GRÁFICA DE INFLACIÓN */}
        <div className="bg-white p-4 sm:p-6 rounded-lg shadow-lg">
          <h2 className="text-xl font-bold mb-4 text-gray-700">Evolución de la Inflación Mensual</h2>
          {chartData.length > 0 ? (
            <CpiChart data={chartData} />
          ) : (
            <div className="text-center text-gray-500 py-16">
              <p>Los datos de inflación para este país se están procesando.</p>
            </div>
          )}
        </div>

        {/* SECCIÓN 3: NUEVA GRÁFICA DE COMPARACIÓN DE PRECIOS */}
        <div className="bg-white p-4 sm:p-6 rounded-lg shadow-lg">
          <h2 className="text-xl font-bold mb-4 text-gray-700">Comparación de Precios por Comercio</h2>
          {priceComparisonData && priceComparisonData.length > 0 ? (
            <ProductPriceComparisonChart data={priceComparisonData as any} />
          ) : (
            <div className="text-center text-gray-500 py-16">
              <p>No hay datos de precios disponibles para comparar en este país.</p>
              <p>Los voluntarios pueden empezar a subir precios para activar esta gráfica.</p>
            </div>
          )}
        </div>
      </div>
    </main>
  );
}