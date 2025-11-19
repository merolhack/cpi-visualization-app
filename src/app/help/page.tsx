// src/app/help/page.tsx
import { Metadata } from 'next';
import Navbar from '@/app/_components/Navbar';

export const metadata: Metadata = {
  title: 'Ayuda y Donaciones - IRPC',
  description: 'Descubre cómo puedes ayudar al proyecto IRPC como voluntario o con donaciones',
};

export default function AyudaPage() {
  return (
    <main className="min-h-screen bg-gray-50">
      <Navbar />
      
      <div className="container mx-auto max-w-4xl px-4 py-8">
        <h1 className="text-4xl font-bold text-gray-900 mb-4 text-center">
          Cómo Puedes Ayudar
        </h1>
        <p className="text-xl text-gray-600 text-center mb-12">
          El IRPC funciona gracias a la colaboración de la comunidad
        </p>

        {/* Ser Voluntario */}
        <section className="bg-white rounded-lg shadow-md p-8 mb-8">
          <div className="flex items-start mb-6">
            <div className="flex-shrink-0 w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mr-4">
              <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
              </svg>
            </div>
            <div className="flex-1">
              <h2 className="text-2xl font-semibold text-gray-800 mb-2">
                Conviértete en Voluntario
              </h2>
              <p className="text-gray-600 mb-4">
                La forma más valiosa de contribuir es registrando precios de productos en tu comunidad
              </p>
            </div>
          </div>

          <div className="space-y-6">
            <div>
              <h3 className="text-lg font-medium text-gray-800 mb-3">
                ¿Qué hace un voluntario?
              </h3>
              <ul className="space-y-2">
                <li className="flex items-start">
                  <span className="flex-shrink-0 w-6 h-6 bg-green-100 text-green-600 rounded-full flex items-center justify-center mr-3 mt-0.5">
                    ✓
                  </span>
                  <span className="text-gray-700">
                    <strong>Toma fotografías</strong> de productos en supermercados, tiendas y otros establecimientos
                  </span>
                </li>
                <li className="flex items-start">
                  <span className="flex-shrink-0 w-6 h-6 bg-green-100 text-green-600 rounded-full flex items-center justify-center mr-3 mt-0.5">
                    ✓
                  </span>
                  <span className="text-gray-700">
                    <strong>Registra los precios</strong> mensualmente de productos que elijas seguir
                  </span>
                </li>
                <li className="flex items-start">
                  <span className="flex-shrink-0 w-6 h-6 bg-green-100 text-green-600 rounded-full flex items-center justify-center mr-3 mt-0.5">
                    ✓
                  </span>
                  <span className="text-gray-700">
                    <strong>Gana puntos</strong> por cada actualización que contribuye al sistema
                  </span>
                </li>
                <li className="flex items-start">
                  <span className="flex-shrink-0 w-6 h-6 bg-green-100 text-green-600 rounded-full flex items-center justify-center mr-3 mt-0.5">
                    ✓
                  </span>
                  <span className="text-gray-700">
                    <strong>Canjea puntos</strong> por tokens IRPC en la red Polygon
                  </span>
                </li>
              </ul>
            </div>

            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <h4 className="font-semibold text-blue-900 mb-2">
                Requisitos mínimos:
              </h4>
              <ul className="space-y-1 text-blue-800 text-sm">
                <li>• Smartphone con cámara</li>
                <li>• Conexión a internet</li>
                <li>• Disposición de actualizar precios al menos una vez al mes</li>
                <li>• Compromiso con la veracidad de la información</li>
              </ul>
            </div>

            <div className="space-y-3">
              <h4 className="font-semibold text-gray-800">
                Formas de registrarte:
              </h4>
              
              <a
                href="/auth/register"
                className="block w-full px-6 py-4 bg-blue-600 text-white font-medium rounded-md hover:bg-blue-700 transition-colors text-center"
              >
                Registrarse en el Sistema
              </a>

              <div className="flex items-center justify-center text-gray-500">
                <span className="px-3">o</span>
              </div>

              <a
                href="https://wa.me/5215531716648?text=Quiero%20ser%20voluntario"
                target="_blank"
                rel="noopener noreferrer"
                className="block w-full px-6 py-4 bg-green-600 text-white font-medium rounded-md hover:bg-green-700 transition-colors text-center"
              >
                Enviar WhatsApp: "Quiero ser voluntario"
              </a>
            </div>
          </div>
        </section>

        {/* Donaciones */}
        <section className="bg-white rounded-lg shadow-md p-8 mb-8">
          <div className="flex items-start mb-6">
            <div className="flex-shrink-0 w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mr-4">
              <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <div className="flex-1">
              <h2 className="text-2xl font-semibold text-gray-800 mb-2">
                Apoya con una Donación
              </h2>
              <p className="text-gray-600 mb-4">
                Ayúdanos a mantener el sitio funcionando y a expandir nuestra cobertura
              </p>
            </div>
          </div>

          <div className="space-y-6">
            <div>
              <h3 className="text-lg font-medium text-gray-800 mb-3">
                ¿En qué se usan las donaciones?
              </h3>
              <div className="grid md:grid-cols-2 gap-4">
                <div className="border border-gray-200 rounded-lg p-4">
                  <div className="font-semibold text-gray-800 mb-2">
                    Infraestructura
                  </div>
                  <p className="text-sm text-gray-600">
                    Servidores, base de datos, almacenamiento de imágenes y ancho de banda
                  </p>
                </div>
                <div className="border border-gray-200 rounded-lg p-4">
                  <div className="font-semibold text-gray-800 mb-2">
                    Desarrollo
                  </div>
                  <p className="text-sm text-gray-600">
                    Mejoras del sistema, nuevas funcionalidades y corrección de errores
                  </p>
                </div>
                <div className="border border-gray-200 rounded-lg p-4">
                  <div className="font-semibold text-gray-800 mb-2">
                    Incentivos
                  </div>
                  <p className="text-sm text-gray-600">
                    Tokens IRPC para recompensar a voluntarios activos
                  </p>
                </div>
                <div className="border border-gray-200 rounded-lg p-4">
                  <div className="font-semibold text-gray-800 mb-2">
                    Expansión
                  </div>
                  <p className="text-sm text-gray-600">
                    Llegar a más países y ciudades con el sistema
                  </p>
                </div>
              </div>
            </div>

            <div className="bg-gradient-to-r from-green-50 to-blue-50 border border-green-200 rounded-lg p-6">
              <h4 className="font-semibold text-gray-800 mb-4 text-center">
                Opciones de Donación
              </h4>
              
              <div className="space-y-3">
                <div className="bg-white rounded-lg p-4 shadow-sm">
                  <div className="flex items-center justify-between mb-2">
                    <span className="font-medium text-gray-800">Criptomonedas</span>
                    <span className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded">Preferido</span>
                  </div>
                  <p className="text-sm text-gray-600 mb-3">
                    Acepta USDT, USDC, ETH en red Polygon
                  </p>
                  <div className="bg-gray-50 rounded p-3 break-all text-xs font-mono text-gray-700">
                    0x658cfd9f5F3F8345d8f71E1758544284dD606ca8
                  </div>
                </div>

                <div className="bg-white rounded-lg p-4 shadow-sm">
                  <div className="flex items-center justify-between mb-2">
                    <span className="font-medium text-gray-800">Transferencia Bancaria</span>
                    <span className="text-xs bg-gray-100 text-gray-800 px-2 py-1 rounded">Disponible</span>
                  </div>
                  <p className="text-sm text-gray-600 mb-2">
                    Contacta por WhatsApp para obtener datos bancarios
                  </p>
                  <a
                    href="https://wa.me/525544332211?text=Quiero%20hacer%20una%20donación"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-block text-sm text-green-600 hover:text-green-700 font-medium"
                  >
                    Enviar mensaje →
                  </a>
                </div>

                <div className="bg-white rounded-lg p-4 shadow-sm">
                  <div className="flex items-center justify-between mb-2">
                    <span className="font-medium text-gray-800">PayPal</span>
                    <span className="text-xs bg-yellow-100 text-yellow-800 px-2 py-1 rounded">Próximamente</span>
                  </div>
                  <p className="text-sm text-gray-600">
                    Estamos trabajando en habilitar donaciones por PayPal
                  </p>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Otras formas de ayudar */}
        <section className="bg-white rounded-lg shadow-md p-8 mb-8">
          <h2 className="text-2xl font-semibold text-gray-800 mb-6">
            Otras Formas de Contribuir
          </h2>

          <div className="grid md:grid-cols-2 gap-6">
            <div className="border-l-4 border-purple-500 pl-4">
              <h3 className="font-semibold text-gray-800 mb-2">
                Difunde el Proyecto
              </h3>
              <p className="text-gray-600 text-sm mb-3">
                Comparte en redes sociales y recomienda el IRPC a amigos y familiares
              </p>
              <div className="flex space-x-3">
                <a
                  href="https://twitter.com/intent/tweet?text=Conoce%20el%20IRPC%20-%20Índice%20Real%20de%20Precios%20al%20Consumidor&url=https://indicedeprecios.com"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-blue-500 hover:text-blue-600"
                >
                  Twitter
                </a>
                <a
                  href="https://www.facebook.com/sharer/sharer.php?u=https://indicedeprecios.com"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-blue-600 hover:text-blue-700"
                >
                  Facebook
                </a>
              </div>
            </div>

            <div className="border-l-4 border-orange-500 pl-4">
              <h3 className="font-semibold text-gray-800 mb-2">
                Reporta Errores
              </h3>
              <p className="text-gray-600 text-sm mb-3">
                Si encuentras algún problema o tienes sugerencias, háznoslo saber
              </p>
              <a
                href="https://wa.me/525544332211?text=Reporte%20de%20error"
                target="_blank"
                rel="noopener noreferrer"
                className="text-orange-600 hover:text-orange-700 text-sm font-medium"
              >
                Enviar reporte →
              </a>
            </div>

            <div className="border-l-4 border-red-500 pl-4">
              <h3 className="font-semibold text-gray-800 mb-2">
                Contribuye con Código
              </h3>
              <p className="text-gray-600 text-sm mb-3">
                El proyecto es de código abierto. Desarrolladores son bienvenidos
              </p>
              <a
                href="https://github.com/irpc-project"
                target="_blank"
                rel="noopener noreferrer"
                className="text-red-600 hover:text-red-700 text-sm font-medium"
              >
                Ver en GitHub →
              </a>
            </div>

            <div className="border-l-4 border-indigo-500 pl-4">
              <h3 className="font-semibold text-gray-800 mb-2">
                Invita Comercios
              </h3>
              <p className="text-gray-600 text-sm">
                Ayuda a convencer a comercios locales para que compartan sus precios directamente
              </p>
            </div>
          </div>
        </section>

        {/* Preguntas frecuentes */}
        <section className="bg-gray-100 rounded-lg p-8">
          <h2 className="text-2xl font-semibold text-gray-800 mb-6 text-center">
            Preguntas Frecuentes
          </h2>

          <div className="space-y-4">
            <details className="bg-white rounded-lg p-4 shadow-sm">
              <summary className="font-medium text-gray-800 cursor-pointer">
                ¿Cuánto tiempo debo dedicar como voluntario?
              </summary>
              <p className="mt-2 text-gray-600 text-sm">
                Aproximadamente 30 minutos al mes. Solo necesitas actualizar los precios de los 
                productos que elegiste seguir, lo cual puedes hacer durante tus compras habituales.
              </p>
            </details>

            <details className="bg-white rounded-lg p-4 shadow-sm">
              <summary className="font-medium text-gray-800 cursor-pointer">
                ¿Qué son los tokens IRPC?
              </summary>
              <p className="mt-2 text-gray-600 text-sm">
                Son tokens en la blockchain de Polygon que recompensan a los voluntarios por su 
                contribución. Pueden ser canjeados o transferidos según las preferencias del usuario.
              </p>
            </details>

            <details className="bg-white rounded-lg p-4 shadow-sm">
              <summary className="font-medium text-gray-800 cursor-pointer">
                ¿Las donaciones son deducibles de impuestos?
              </summary>
              <p className="mt-2 text-gray-600 text-sm">
                Actualmente el proyecto no cuenta con figura fiscal que permita emitir recibos 
                deducibles. Estamos trabajando en esta opción.
              </p>
            </details>
          </div>
        </section>
      </div>
    </main>
  );
}