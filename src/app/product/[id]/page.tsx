// src/app/product/[id]/page.tsx
import { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { createClient } from '@/app/lib/supabase/server';
import Navbar from '@/app/_components/Navbar';
import ProductPriceHistoryChart from '@/app/_components/ProductPriceHistoryChart';
import DownloadDataButton from './DownloadDataButton';

export const dynamic = 'force-dynamic';

type Props = {
  params: Promise<{ id: string }>;
};

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { id } = await params;
  const supabase = await createClient();

  const { data: product } = await supabase
    .from('cpi_products')
    .select('product_name')
    .eq('product_id', parseInt(id))
    .single();

  return {
    title: product ? `${product.product_name} - IRPC` : 'Producto - IRPC',
    description: product ? `Historial de precios de ${product.product_name}` : 'Producto no encontrado',
  };
}

export default async function ProductoPage({ params }: Props) {
  const { id } = await params;
  const supabase = await createClient();

  // Obtener información del producto
  const { data: product, error } = await supabase
    .from('cpi_products')
    .select(`
      product_id,
      product_name,
      product_photo_url,
      cpi_categories!inner(category_name),
      cpi_countries!inner(country_name)
    `)
    .eq('product_id', parseInt(id))
    .eq('is_active_product', true)
    .single();

  if (error || !product) {
    notFound();
  }

  // Obtener precios del producto
  const { data: prices } = await supabase
    .from('cpi_prices')
    .select(`
      price_id,
      price_value,
      date,
      price_photo_url,
      cpi_locations!inner(location_name),
      cpi_establishments!inner(establishment_name)
    `)
    .eq('product_id', parseInt(id))
    .eq('is_valid', true)
    .order('date', { ascending: false })
    .limit(100); // Aumentado el límite para la gráfica

  // Preparar datos para la gráfica
  const chartData = prices?.map(p => ({
    date: new Date(p.date),
    price: parseFloat(p.price_value.toString()),
    establishment: (p.cpi_establishments as any)?.establishment_name || 'Desconocido',
    location: (p.cpi_locations as any)?.location_name || 'Desconocido'
  })).sort((a, b) => a.date.getTime() - b.date.getTime()) || [];

  return (
    <main className="min-h-screen bg-gray-50">
      <Navbar />
      
      <div className="container mx-auto max-w-6xl px-4 py-8">
        {/* Encabezado del producto */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-8">
          <div className="flex flex-col md:flex-row items-start md:items-center space-y-4 md:space-y-0 md:space-x-6">
            {product.product_photo_url && (
              <img
                src={product.product_photo_url}
                alt={product.product_name}
                className="w-32 h-32 object-cover rounded-lg border border-gray-200"
              />
            )}
            <div className="flex-1">
              <h1 className="text-3xl font-bold text-gray-900 mb-2">
                {product.product_name}
              </h1>
              <div className="flex flex-wrap gap-2">
                <span className="inline-block px-3 py-1 bg-blue-100 text-blue-800 text-sm rounded-full">
                  {(product.cpi_categories as any)?.category_name || 'Sin categoría'}
                </span>
                <span className="inline-block px-3 py-1 bg-green-100 text-green-800 text-sm rounded-full">
                  {(product.cpi_countries as any)?.country_name || 'Sin país'}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Estadísticas del producto */}
        {prices && prices.length > 0 && (
          <div className="grid md:grid-cols-3 gap-6 mb-8">
            <div className="bg-white rounded-lg shadow-md p-6">
              <h3 className="text-sm font-medium text-gray-600 mb-2">
                Precio Actual Promedio
              </h3>
              <p className="text-3xl font-bold text-blue-600">
                ${(prices.reduce((sum, p) => sum + parseFloat(p.price_value.toString()), 0) / prices.length).toFixed(2)}
              </p>
            </div>
            <div className="bg-white rounded-lg shadow-md p-6">
              <h3 className="text-sm font-medium text-gray-600 mb-2">
                Total de Registros
              </h3>
              <p className="text-3xl font-bold text-green-600">
                {prices.length}
              </p>
            </div>
            <div className="bg-white rounded-lg shadow-md p-6">
              <h3 className="text-sm font-medium text-gray-600 mb-2">
                Última Actualización
              </h3>
              <p className="text-lg font-bold text-gray-800">
                {new Date(prices[0].date).toLocaleDateString('es-ES', {
                  year: 'numeric',
                  month: 'long',
                  day: 'numeric'
                })}
              </p>
            </div>
          </div>
        )}

        {/* Gráfica de evolución de precios */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-8">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-2xl font-semibold text-gray-800">
              Evolución de Precios
            </h2>
            <DownloadDataButton data={prices || []} productName={product.product_name} />
          </div>
          
          {chartData.length > 0 ? (
            <ProductPriceHistoryChart data={chartData} />
          ) : (
            <div className="text-center py-16 text-gray-500">
              <p>No hay suficientes datos para mostrar la gráfica</p>
            </div>
          )}
        </div>

        {/* Tabla de precios */}
        {prices && prices.length > 0 && (
          <div className="bg-white rounded-lg shadow-md p-6 mb-8">
            <h2 className="text-2xl font-semibold text-gray-800 mb-6">
              Historial de Precios
            </h2>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                      Fecha
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                      Precio
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                      Lugar
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                      Comercio
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                      Evidencia
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {prices.map((price) => (
                    <tr key={price.price_id} className="hover:bg-gray-50">
                      <td className="px-4 py-3 text-sm text-gray-700">
                        {new Date(price.date).toLocaleDateString('es-ES')}
                      </td>
                      <td className="px-4 py-3 text-sm font-medium text-gray-900">
                        ${parseFloat(price.price_value.toString()).toFixed(2)}
                      </td>
                      <td className="px-4 py-3 text-sm text-gray-700">
                        {(price.cpi_locations as any)?.location_name || 'N/A'}
                      </td>
                      <td className="px-4 py-3 text-sm text-gray-700">
                        {(price.cpi_establishments as any)?.establishment_name || 'N/A'}
                      </td>
                      <td className="px-4 py-3 text-sm">
                        {price.price_photo_url ? (
                          <a
                            href={price.price_photo_url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-blue-600 hover:text-blue-700"
                          >
                            Ver foto
                          </a>
                        ) : (
                          <span className="text-gray-400">Sin foto</span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Carrusel de evidencias fotográficas */}
        {prices && prices.filter(p => p.price_photo_url).length > 0 && (
          <div className="bg-white rounded-lg shadow-md p-6">
            <h2 className="text-2xl font-semibold text-gray-800 mb-6">
              Evidencias Fotográficas
            </h2>
            <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
              {prices
                .filter(p => p.price_photo_url)
                .slice(0, 12)
                .map((price) => (
                  <a
                    key={price.price_id}
                    href={price.price_photo_url!}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="group"
                  >
                    <img
                      src={price.price_photo_url!}
                      alt={`Precio del ${new Date(price.date).toLocaleDateString()}`}
                      className="w-full h-32 object-cover rounded-lg border border-gray-200 group-hover:opacity-75 transition-opacity"
                    />
                    <p className="text-xs text-gray-600 mt-1 text-center">
                      {new Date(price.date).toLocaleDateString('es-ES', { 
                        month: 'short', 
                        day: 'numeric' 
                      })}
                    </p>
                  </a>
                ))}
            </div>
          </div>
        )}

        {/* Sin datos */}
        {(!prices || prices.length === 0) && (
          <div className="bg-white rounded-lg shadow-md p-12 text-center">
            <p className="text-gray-500 mb-4">
              Este producto aún no tiene registros de precios
            </p>
            <a
              href="/auth/register"
              className="inline-block px-6 py-3 bg-blue-600 text-white font-medium rounded-md hover:bg-blue-700 transition-colors"
            >
              Sé el primero en agregar precios
            </a>
          </div>
        )}
      </div>
    </main>
  );
}