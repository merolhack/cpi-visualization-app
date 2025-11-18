// src/app/add-product/page.tsx
import { Metadata } from 'next';
import { redirect } from 'next/navigation';
import { createClient } from '@/app/lib/supabase/server';
import AddProductForm from '@/app/_components/AddProductForm';
import Navbar from '@/app/_components/Navbar';

export const metadata: Metadata = {
  title: 'Agregar Producto - IRPC',
  description: 'Agrega un nuevo producto al sistema de seguimiento de precios',
};

export default async function AgregarProductoPage() {
  const supabase = await createClient();

  // ✅ Usar getUser() en lugar de getSession() para mayor seguridad
  const { data: { user }, error } = await supabase.auth.getUser();

  if (error || !user) {
    redirect('/auth/login?next=/add-product');
  }

  // Obtener información del voluntario
  const { data: volunteer } = await supabase
    .from('cpi_volunteers')
    .select('name, email')
    .eq('user_id', user.id)
    .single();

  return (
    <main className="min-h-screen bg-gray-50">
      <Navbar />

      <div className="container mx-auto max-w-4xl px-4 py-8">
        {volunteer && (
          <div className="mb-6 bg-white rounded-lg shadow p-4">
            <p className="text-sm text-gray-600">
              Conectado como: <span className="font-medium">{volunteer.name}</span>
            </p>
          </div>
        )}

        <div className="mb-6">
          <h1 className="text-3xl font-bold text-gray-800">Agregar Nuevo Producto</h1>
          <p className="text-gray-600 mt-2">
            Completa el formulario para agregar un producto al sistema de seguimiento de precios.
          </p>
        </div>
        
        <AddProductForm />
      </div>
    </main>
  );
}