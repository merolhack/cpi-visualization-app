// src/app/page.tsx
import { createClient } from '@/app/lib/supabase/server';
import { headers } from 'next/headers';
import CpiChart from '@/app/_components/CpiChart';
import CountrySelector from '@/app/_components/CountrySelector';
import ProductPriceComparisonChart from '@/app/_components/ProductPriceComparisonChart';
import Navbar from '@/app/_components/Navbar';
import ProductSearch from '@/app/_components/ProductSearch';

export const dynamic = 'force-dynamic';

export default async function HomePage({ 
  searchParams 
}: { 
  searchParams: Promise<{ [key: string]: string | undefined }> 
}) {
  const resolvedSearchParams = await searchParams;
  headers();

  const supabase = await createClient();

  const { data: countries } = await supabase
    .from('cpi_countries')
    .select('country_id, country_name');

  const selectedCountryId = resolvedSearchParams?.countryId ?? '1';
  const selectedCountry = countries?.find(c => c.country_id.toString() === selectedCountryId);

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

  const { data: priceComparisonData } = await supabase.rpc('get_latest_prices_by_country', {
    p_country_id: parseInt(selectedCountryId)
  });

  // Obtener estadísticas del sistema
  const { count: totalPhotos } = await supabase
    .from('cpi_prices')
    .select('*', { count: 'exact', head: true })
    .eq('is_valid', true);

  const { count: totalProducts } = await supabase
    .from('cpi_products')
    .select('*', { count: 'exact', head: true })
    .eq('is_active_product', true);

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

        {/* Buscador de productos */}
        <section className="mb-8 flex justify-center">
          <ProductSearch />
        </section>

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

        {/* Información del sistema y WhatsApp */}
        <section className="bg-white rounded-lg shadow-lg p-8 mb-12">
          <div className="text-center mb-8">
            <h3 className="text-2xl font-bold text-gray-800 mb-4">
              Ayúdanos enviando fotos de precios
            </h3>
            <p className="text-gray-600 mb-6">
              Envía fotos de los precios de los productos que compras
            </p>
            <a
              href="https://wa.me/525544332211?text=Quiero%20colaborar%20enviando%20precios"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center px-6 py-3 bg-green-600 text-white font-medium rounded-lg hover:bg-green-700 transition-colors"
            >
              <svg className="w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 24 24">
                <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413Z"/>
              </svg>
              WhatsApp: +52 55 4433 2211
            </a>
          </div>

          {/* Estadísticas */}
          {(totalPhotos || totalProducts) && (
            <div className="border-t border-gray-200 pt-6">
              <p className="text-center text-gray-700">
                Nuestro objetivo es conocer el índice real de precios al consumidor.
              </p>
              <p className="text-center text-gray-600 mt-2">
                Sitio web mantenido por cientos de personas que colaboran voluntariamente.
              </p>
              <p className="text-center font-semibold text-gray-800 mt-4">
                Contamos con {totalPhotos?.toLocaleString() || '0'} fotos de los precios de{' '}
                {totalProducts?.toLocaleString() || '0'} productos y servicios en {selectedCountry?.country_name || 'el sistema'}.
              </p>
            </div>
          )}
        </section>

        {/* Enlaces a países y recursos */}
        <section className="grid md:grid-cols-2 gap-8 mb-12">
          {/* Países disponibles */}
          <div className="bg-white rounded-lg shadow-md p-6">
            <h3 className="text-xl font-semibold text-gray-800 mb-4">
              Países Disponibles
            </h3>
            <div className="space-y-2">
              {countries?.map((country) => (
                <a
                  key={country.country_id}
                  href={`/?countryId=${country.country_id}`}
                  className="block px-4 py-2 rounded hover:bg-blue-50 transition-colors text-gray-700 hover:text-blue-600"
                >
                  {country.country_name}
                </a>
              ))}
            </div>
          </div>

          {/* Recursos y enlaces */}
          <div className="bg-white rounded-lg shadow-md p-6">
            <h3 className="text-xl font-semibold text-gray-800 mb-4">
              Recursos
            </h3>
            <div className="space-y-3">
              <a
                href="/methodology"
                className="flex items-center text-gray-700 hover:text-blue-600 transition-colors"
              >
                <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
                Metodología usada
              </a>
              <a
                href="/help"
                className="flex items-center text-gray-700 hover:text-blue-600 transition-colors"
              >
                <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                </svg>
                Ayuda siendo voluntario
              </a>
              <a
                href="/help#donaciones"
                className="flex items-center text-gray-700 hover:text-blue-600 transition-colors"
              >
                <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                Dona para mantener el sitio
              </a>
              <div className="border-t border-gray-200 pt-3 mt-3">
                <p className="text-sm text-gray-600 mb-2">Síguenos en redes:</p>
                <div className="flex space-x-4">
                  <a
                    href="https://instagram.com/irpc"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-pink-600 hover:text-pink-700"
                  >
                    Instagram
                  </a>
                  <a
                    href="https://twitter.com/irpc"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-blue-500 hover:text-blue-600"
                  >
                    X (Twitter)
                  </a>
                </div>
              </div>
            </div>
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