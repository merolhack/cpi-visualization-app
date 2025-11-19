// src/app/dashboard/page.tsx
import { Metadata } from 'next';
import { redirect } from 'next/navigation';
import { createClient } from '@/app/lib/supabase/server';
import Navbar from '@/app/_components/Navbar';
import Link from 'next/link';

export const metadata: Metadata = {
  title: 'Panel de Voluntario - IRPC',
  description: 'Panel de control para voluntarios',
};

export default async function PanelVoluntarioPage() {
  const supabase = await createClient();

  const { data: { user }, error } = await supabase.auth.getUser();

  if (error || !user) {
    redirect('/auth/login?next=/dashboard');
  }

  // Obtener información del dashboard
  const { data: dashboardData, error: dashboardError } = await supabase
    .rpc('get_volunteer_dashboard');

  if (dashboardError) {
    console.error('Error al obtener dashboard:', dashboardError);
  }

  const dashboard = dashboardData || {
    name: 'Voluntario',
    current_balance: 0,
    products_needing_update: 0
  };

  // Obtener productos que necesitan actualización
  const { data: productsNeedingUpdate } = await supabase
    .rpc('get_products_needing_update');

  const allProductsUpdated = !productsNeedingUpdate || productsNeedingUpdate.length === 0;

  return (
    <main className="min-h-screen bg-gray-50">
      <Navbar />

      <div className="container mx-auto max-w-6xl px-4 py-8">
        {/* Encabezado con saludo y saldo */}
        <div className="bg-gradient-to-r from-blue-500 to-blue-600 rounded-lg shadow-lg p-8 text-white mb-8">
          <h1 className="text-3xl font-bold mb-2">
            Hola, {dashboard.name}
          </h1>
          <div className="flex items-baseline">
            <span className="text-5xl font-bold">{dashboard.current_balance}</span>
            <span className="text-2xl ml-2 opacity-90">puntos acumulados</span>
          </div>
          <p className="mt-4 text-blue-100">
            Gracias por tu contribución al sistema IRPC
          </p>
        </div>

        {/* Productos que necesitan actualización */}
        {!allProductsUpdated && (
          <section className="bg-white rounded-lg shadow-md p-6 mb-8">
            <div className="flex items-center mb-4">
              <div className="flex-shrink-0 w-10 h-10 bg-orange-100 rounded-full flex items-center justify-center mr-3">
                <svg className="w-6 h-6 text-orange-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <div>
                <h2 className="text-xl font-semibold text-gray-800">
                  Productos que necesitan actualización
                </h2>
                <p className="text-sm text-gray-600">
                  Tienes {dashboard.products_needing_update} productos con más de 30 días sin actualizar
                </p>
              </div>
            </div>

            <div className="space-y-3">
              {productsNeedingUpdate?.slice(0, 10).map((product: any) => (
                <div 
                  key={product.tracking_id}
                  className="flex items-center justify-between p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  <div className="flex-1">
                    <h3 className="font-medium text-gray-900">
                      {product.product_name}
                    </h3>
                    <p className="text-sm text-gray-600">
                      {product.establishment_name} • {product.location_name}
                    </p>
                    <p className="text-xs text-orange-600 mt-1">
                      Última actualización hace {product.days_since_update} días
                    </p>
                  </div>
                  <Link
                    href={`/dashboard/update/${product.tracking_id}`}
                    className="ml-4 px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-md hover:bg-blue-700 transition-colors"
                  >
                    Actualizar
                  </Link>
                </div>
              ))}
            </div>

            {dashboard.products_needing_update > 10 && (
              <p className="text-sm text-gray-600 mt-4 text-center">
                y {dashboard.products_needing_update - 10} productos más...
              </p>
            )}
          </section>
        )}

        {/* Todos los productos actualizados */}
        {allProductsUpdated && (
          <section className="bg-white rounded-lg shadow-md p-8 mb-8 text-center">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-green-100 rounded-full mb-4">
              <svg className="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <h2 className="text-2xl font-bold text-gray-800 mb-2">
              ¡Felicidades!
            </h2>
            <p className="text-gray-600 mb-6">
              Todos los productos que decidiste llevar seguimiento están actualizados.
            </p>
            <p className="text-gray-600">
              Si gustas, agrega más productos a tu lista de seguimiento.
            </p>
          </section>
        )}

        {/* Acciones rápidas */}
        <div className="grid md:grid-cols-3 gap-6 mb-8">
          <Link
            href="/dashboard/add-products"
            className="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition-shadow"
          >
            <div className="flex items-center mb-4">
              <div className="flex-shrink-0 w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mr-4">
                <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                </svg>
              </div>
              <h3 className="text-lg font-semibold text-gray-800">
                Agregar Productos
              </h3>
            </div>
            <p className="text-sm text-gray-600">
              Selecciona nuevos productos para dar seguimiento a sus precios
            </p>
          </Link>

          <Link
            href="/dashboard/withdrawals"
            className="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition-shadow"
          >
            <div className="flex items-center mb-4">
              <div className="flex-shrink-0 w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mr-4">
                <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2zm7-5a2 2 0 11-4 0 2 2 0 014 0z" />
                </svg>
              </div>
              <h3 className="text-lg font-semibold text-gray-800">
                Retirar Puntos
              </h3>
            </div>
            <p className="text-sm text-gray-600">
              Convierte tus puntos en tokens IRPC
            </p>
          </Link>

          <Link
            href="/dashboard/history"
            className="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition-shadow"
          >
            <div className="flex items-center mb-4">
              <div className="flex-shrink-0 w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center mr-4">
                <svg className="w-6 h-6 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01" />
                </svg>
              </div>
              <h3 className="text-lg font-semibold text-gray-800">
                Ver Historial
              </h3>
            </div>
            <p className="text-sm text-gray-600">
              Revisa tu historial de movimientos y retiros
            </p>
          </Link>
        </div>

        {/* Información adicional */}
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
          <h3 className="font-semibold text-blue-900 mb-2">
            💡 ¿Sabías que...?
          </h3>
          <ul className="space-y-2 text-sm text-blue-800">
            <li>• Ganas 1 punto por cada actualización de precio (si han pasado más de 30 días)</li>
            <li>• Puedes canjear tus puntos por tokens IRPC en la red Polygon</li>
            <li>• Al agregar productos, el sistema te sugiere productos que otros voluntarios no están siguiendo</li>
            <li>• Recibirás un correo recordatorio si tienes productos con más de 30 días sin actualizar</li>
          </ul>
        </div>
      </div>
    </main>
  );
}