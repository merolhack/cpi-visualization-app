// src/app/methodology/page.tsx
import { Metadata } from 'next';
import Navbar from '@/app/_components/Navbar';

export const metadata: Metadata = {
  title: 'Metodología - IRPC',
  description: 'Conoce cómo calculamos el Índice Real de Precios al Consumidor',
};

export default function MetodologiaPage() {
  return (
    <main className="min-h-screen bg-gray-50">
      <Navbar />
      
      <div className="container mx-auto max-w-4xl px-4 py-8">
        <h1 className="text-4xl font-bold text-gray-900 mb-8">
          Metodología del IRPC
        </h1>

        {/* Introducción */}
        <section className="bg-white rounded-lg shadow-md p-6 mb-8">
          <h2 className="text-2xl font-semibold text-gray-800 mb-4">
            ¿Qué es el IRPC?
          </h2>
          <p className="text-gray-700 leading-relaxed mb-4">
            El <strong>Índice Real de Precios al Consumidor (IRPC)</strong> es un indicador que 
            mide la variación de precios de productos y servicios de consumo cotidiano, basado en 
            información real proporcionada por voluntarios en diferentes puntos de venta.
          </p>
          <p className="text-gray-700 leading-relaxed">
            A diferencia de otros índices de precios, el IRPC se nutre de datos recopilados 
            directamente por la ciudadanía, ofreciendo una perspectiva más cercana a la realidad 
            del consumidor.
          </p>
        </section>

        {/* Recopilación de Datos */}
        <section className="bg-white rounded-lg shadow-md p-6 mb-8">
          <h2 className="text-2xl font-semibold text-gray-800 mb-4">
            1. Recopilación de Datos
          </h2>
          
          <div className="space-y-4">
            <div>
              <h3 className="text-xl font-medium text-gray-800 mb-2">
                Voluntarios
              </h3>
              <p className="text-gray-700 leading-relaxed">
                Cientos de voluntarios en diferentes ciudades registran los precios de productos 
                específicos en establecimientos comerciales. Cada voluntario puede seleccionar qué 
                productos desea seguir y en qué comercios.
              </p>
            </div>

            <div>
              <h3 className="text-xl font-medium text-gray-800 mb-2">
                Evidencia Fotográfica
              </h3>
              <p className="text-gray-700 leading-relaxed">
                Cada precio registrado debe estar respaldado por una fotografía del producto en el 
                punto de venta, asegurando la veracidad de la información.
              </p>
            </div>

            <div>
              <h3 className="text-xl font-medium text-gray-800 mb-2">
                Frecuencia
              </h3>
              <p className="text-gray-700 leading-relaxed">
                Los precios se actualizan mensualmente. El sistema notifica a los voluntarios cuando 
                un producto requiere actualización (más de 30 días sin registro).
              </p>
            </div>
          </div>
        </section>

        {/* Cálculo de Inflación */}
        <section className="bg-white rounded-lg shadow-md p-6 mb-8">
          <h2 className="text-2xl font-semibold text-gray-800 mb-4">
            2. Cálculo de la Inflación Anualizada
          </h2>

          <div className="space-y-6">
            <div>
              <h3 className="text-xl font-medium text-gray-800 mb-3">
                Paso 1: Inflación por Producto
              </h3>
              <p className="text-gray-700 leading-relaxed mb-3">
                Para cada producto en un comercio y lugar específico, calculamos la inflación 
                anualizada comparando el precio actual con el precio de hace aproximadamente un año.
              </p>
              <div className="bg-gray-50 p-4 rounded-md border border-gray-200">
                <p className="font-mono text-sm text-gray-800 mb-2">
                  Tasa diaria = (Precio Actual / Precio Histórico)^(1/días) - 1
                </p>
                <p className="font-mono text-sm text-gray-800">
                  Tasa anual = (1 + Tasa diaria)^365 - 1
                </p>
              </div>
            </div>

            <div>
              <h3 className="text-xl font-medium text-gray-800 mb-3">
                Paso 2: Inflación por Categoría y Lugar
              </h3>
              <p className="text-gray-700 leading-relaxed">
                Se calcula el promedio de inflación de todos los productos activos dentro de la 
                misma categoría (por ejemplo: "Lácteos") para cada lugar específico.
              </p>
            </div>

            <div>
              <h3 className="text-xl font-medium text-gray-800 mb-3">
                Paso 3: Inflación por Categoría Nacional
              </h3>
              <p className="text-gray-700 leading-relaxed">
                Se pondera la inflación de cada lugar según su población. Los lugares con mayor 
                población tienen más peso en el cálculo nacional.
              </p>
            </div>

            <div>
              <h3 className="text-xl font-medium text-gray-800 mb-3">
                Paso 4: IRPC Final
              </h3>
              <p className="text-gray-700 leading-relaxed mb-3">
                El IRPC se calcula ponderando la inflación de cada categoría según criterios 
                establecidos que reflejan la importancia de cada categoría en el gasto del consumidor.
              </p>
              <div className="bg-blue-50 p-4 rounded-md border border-blue-200">
                <p className="text-sm text-blue-900">
                  <strong>Ejemplo:</strong> Si las categorías tienen las siguientes ponderaciones:
                  Alimentos (40%), Transporte (30%), Vivienda (20%), Otros (10%), el IRPC será la 
                  suma ponderada de la inflación de cada categoría.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* Criterios de Evaluación */}
        <section className="bg-white rounded-lg shadow-md p-6 mb-8">
          <h2 className="text-2xl font-semibold text-gray-800 mb-4">
            3. Criterios de Evaluación
          </h2>
          
          <p className="text-gray-700 leading-relaxed mb-4">
            El sistema permite calcular diferentes índices según distintos criterios:
          </p>

          <div className="space-y-3">
            <div className="border-l-4 border-blue-500 pl-4">
              <h4 className="font-semibold text-gray-800">Inflación General</h4>
              <p className="text-gray-700 text-sm">
                Incluye todas las categorías de productos y servicios.
              </p>
            </div>

            <div className="border-l-4 border-green-500 pl-4">
              <h4 className="font-semibold text-gray-800">Inflación Subyacente</h4>
              <p className="text-gray-700 text-sm">
                Excluye productos con alta volatilidad estacional (frutas, verduras, combustibles).
              </p>
            </div>

            <div className="border-l-4 border-purple-500 pl-4">
              <h4 className="font-semibold text-gray-800">Criterios Personalizados</h4>
              <p className="text-gray-700 text-sm">
                Es posible crear criterios específicos ajustando las ponderaciones de cada categoría.
              </p>
            </div>
          </div>
        </section>

        {/* Transparencia */}
        <section className="bg-white rounded-lg shadow-md p-6 mb-8">
          <h2 className="text-2xl font-semibold text-gray-800 mb-4">
            4. Transparencia y Validación
          </h2>

          <div className="space-y-4">
            <div>
              <h3 className="text-xl font-medium text-gray-800 mb-2">
                Datos Abiertos
              </h3>
              <p className="text-gray-700 leading-relaxed">
                Todos los datos recopilados, incluyendo fotografías de evidencia y precios históricos, 
                son accesibles al público. Cada producto cuenta con una página dedicada donde se puede 
                ver su evolución de precios.
              </p>
            </div>

            <div>
              <h3 className="text-xl font-medium text-gray-800 mb-2">
                Validación Automática
              </h3>
              <p className="text-gray-700 leading-relaxed">
                El sistema cuenta con mecanismos de validación que detectan precios atípicos o 
                inconsistentes, los cuales son revisados antes de incluirse en los cálculos.
              </p>
            </div>

            <div>
              <h3 className="text-xl font-medium text-gray-800 mb-2">
                Código Abierto
              </h3>
              <p className="text-gray-700 leading-relaxed">
                La metodología de cálculo está completamente documentada y los algoritmos son de código 
                abierto, permitiendo su revisión y auditoría por parte de la comunidad.
              </p>
            </div>
          </div>
        </section>

        {/* Limitaciones */}
        <section className="bg-white rounded-lg shadow-md p-6 mb-8">
          <h2 className="text-2xl font-semibold text-gray-800 mb-4">
            5. Limitaciones
          </h2>

          <p className="text-gray-700 leading-relaxed mb-4">
            Es importante tener en cuenta las siguientes limitaciones del IRPC:
          </p>

          <ul className="list-disc list-inside space-y-2 text-gray-700">
            <li>
              La cobertura depende de la cantidad y distribución de voluntarios activos
            </li>
            <li>
              Algunos productos o regiones pueden tener menos datos que otros
            </li>
            <li>
              Los datos reflejan precios en establecimientos específicos, que pueden variar de otros 
              puntos de venta
            </li>
            <li>
              El índice es complementario, no sustituto, de las estadísticas oficiales
            </li>
          </ul>
        </section>

        {/* Llamado a la acción */}
        <section className="bg-gradient-to-r from-blue-500 to-blue-600 rounded-lg shadow-md p-8 text-center text-white">
          <h2 className="text-2xl font-bold mb-4">
            ¿Quieres contribuir a mejorar el IRPC?
          </h2>
          <p className="mb-6 text-blue-50">
            Únete como voluntario y ayuda a mantener datos precisos y actualizados del costo de vida.
          </p>
          <a
            href="/auth/register"
            className="inline-block px-6 py-3 bg-white text-blue-600 font-medium rounded-md hover:bg-blue-50 transition-colors"
          >
            Registrarse como Voluntario
          </a>
        </section>
      </div>
    </main>
  );
}