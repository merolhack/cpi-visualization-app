import { Metadata } from 'next';
import { redirect } from 'next/navigation';
import { createClient } from '@/app/lib/supabase/server';
import Navbar from '@/app/_components/Navbar';
import Link from 'next/link';
import { revalidatePath } from 'next/cache';

export const metadata: Metadata = {
  title: 'Actualizar Precio - IRPC',
  description: 'Actualizar el precio de un producto',
};

export default async function UpdatePricePage({ params }: { params: { trackingId: string } }) {
  const supabase = await createClient();
  const { trackingId } = params;

  const { data: { user }, error } = await supabase.auth.getUser();

  if (error || !user) {
    redirect('/auth/login?next=/dashboard');
  }

  // Fetch tracking details and history
  // We need to join tables to get product info. The RPC get_product_price_history gives us history.
  // We also need product details. I'll use a direct query for details since there isn't a specific RPC for "get tracking details" that returns everything I need in one go easily, 
  // OR I can use the existing `get_products_needing_update` but that filters by date.
  // Let's query cpi_tracking joined with products, establishments, locations.
  
  const { data: trackingData, error: trackingError } = await supabase
    .from('cpi_tracking')
    .select(`
      tracking_id,
      product:cpi_products (product_name, product_photo_url, ean_code),
      establishment:cpi_establishments (establishment_name),
      location:cpi_locations (location_name)
    `)
    .eq('tracking_id', trackingId)
    .eq('user_id', user.id)
    .single();

  if (trackingError || !trackingData) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Navbar />
        <div className="container mx-auto max-w-4xl px-4 py-8 text-center">
          <h1 className="text-2xl font-bold text-red-600">Producto no encontrado</h1>
          <p className="mt-4 text-gray-600">No tienes permiso para ver este producto o no existe.</p>
          <Link href="/dashboard" className="mt-6 inline-block text-blue-600 hover:underline">
            &larr; Volver al panel
          </Link>
        </div>
      </div>
    );
  }

  const { data: historyData } = await supabase
    .rpc('get_product_price_history', { p_tracking_id: trackingId });

  async function updatePrice(formData: FormData) {
    'use server';
    
    const supabase = await createClient();
    const price = formData.get('price');
    const photoUrl = formData.get('photo_url') as string || ''; // Placeholder for now
    
    if (!price) return;

    const { error } = await supabase.rpc('update_product_price', {
      p_tracking_id: trackingId,
      p_price_value: parseFloat(price.toString()),
      p_date: new Date().toISOString(),
      p_photo_url: photoUrl
    });

    if (error) {
      console.error('Error updating price:', error);
      // Handle error (could redirect to error page or show toast if client component)
      return;
    }

    revalidatePath('/dashboard');
    redirect('/dashboard');
  }

  async function stopTracking() {
    'use server';
    const supabase = await createClient();
    await supabase.rpc('deactivate_product_tracking', { p_tracking_id: trackingId });
    revalidatePath('/dashboard');
    redirect('/dashboard');
  }

  return (
    <main className="min-h-screen bg-gray-50">
      <Navbar />

      <div className="container mx-auto max-w-2xl px-4 py-8">
        <Link href="/dashboard" className="text-gray-500 hover:text-gray-700 text-sm mb-6 inline-flex items-center">
          <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
          Volver al panel
        </Link>

        <div className="bg-white rounded-lg shadow-md overflow-hidden">
          <div className="p-6 border-b border-gray-100">
            <div className="flex items-start justify-between">
              <div>
                <h1 className="text-2xl font-bold text-gray-900 mb-1">
                  {/* @ts-ignore */}
                  {trackingData.product.product_name}
                </h1>
                <p className="text-gray-600">
                  {/* @ts-ignore */}
                  {trackingData.establishment.establishment_name} • {trackingData.location.location_name}
                </p>
              </div>
              {/* @ts-ignore */}
              {trackingData.product.product_photo_url && (
                <img 
                  /* @ts-ignore */
                  src={trackingData.product.product_photo_url} 
                  /* @ts-ignore */
                  alt={trackingData.product.product_name}
                  className="w-16 h-16 object-cover rounded-md border border-gray-200"
                />
              )}
            </div>
          </div>

          <div className="p-6">
            <h2 className="text-lg font-semibold text-gray-800 mb-4">Actualizar Precio</h2>
            
            <form action={updatePrice} className="space-y-6">
              <div>
                <label htmlFor="price" className="block text-sm font-medium text-gray-700 mb-1">
                  Nuevo Precio ($)
                </label>
                <div className="relative rounded-md shadow-sm">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <span className="text-gray-500 sm:text-sm">$</span>
                  </div>
                  <input
                    type="number"
                    name="price"
                    id="price"
                    step="0.01"
                    min="0"
                    required
                    className="focus:ring-blue-500 focus:border-blue-500 block w-full pl-7 pr-12 sm:text-sm border-gray-300 rounded-md py-3"
                    placeholder="0.00"
                  />
                  <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
                    <span className="text-gray-500 sm:text-sm">MXN</span>
                  </div>
                </div>
              </div>

              {/* Placeholder for photo upload - in a real app this would handle file upload to storage */}
              <div>
                <label htmlFor="photo_url" className="block text-sm font-medium text-gray-700 mb-1">
                  URL de la foto (Opcional)
                </label>
                <input
                  type="url"
                  name="photo_url"
                  id="photo_url"
                  className="focus:ring-blue-500 focus:border-blue-500 block w-full sm:text-sm border-gray-300 rounded-md py-2"
                  placeholder="https://..."
                />
                <p className="mt-1 text-xs text-gray-500">
                  * Por ahora solo aceptamos URLs directas de imágenes.
                </p>
              </div>

              <button
                type="submit"
                className="w-full flex justify-center py-3 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
              >
                Guardar Precio
              </button>
            </form>
          </div>

          {historyData && historyData.length > 0 && (
            <div className="bg-gray-50 p-6 border-t border-gray-100">
              <h3 className="text-sm font-semibold text-gray-900 uppercase tracking-wider mb-4">
                Historial Reciente
              </h3>
              <div className="flow-root">
                <ul className="-mb-8">
                  {historyData.map((record: any, idx: number) => (
                    <li key={idx}>
                      <div className="relative pb-8">
                        {idx !== historyData.length - 1 ? (
                          <span className="absolute top-4 left-4 -ml-px h-full w-0.5 bg-gray-200" aria-hidden="true" />
                        ) : null}
                        <div className="relative flex space-x-3">
                          <div>
                            <span className="h-8 w-8 rounded-full bg-blue-100 flex items-center justify-center ring-8 ring-white">
                              <svg className="h-5 w-5 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                              </svg>
                            </span>
                          </div>
                          <div className="min-w-0 flex-1 pt-1.5 flex justify-between space-x-4">
                            <div>
                              <p className="text-sm text-gray-500">
                                Precio registrado: <span className="font-medium text-gray-900">${record.price_value}</span>
                              </p>
                            </div>
                            <div className="text-right text-sm whitespace-nowrap text-gray-500">
                              <time dateTime={record.date}>{new Date(record.date).toLocaleDateString()}</time>
                            </div>
                          </div>
                        </div>
                      </div>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          )}

          <div className="bg-gray-50 px-6 py-4 border-t border-gray-200">
            <form action={stopTracking}>
              <button
                type="submit"
                className="text-sm text-red-600 hover:text-red-800 font-medium"
              >
                Ya no quiero dar seguimiento a este producto
              </button>
            </form>
          </div>
        </div>
      </div>
    </main>
  );
}
