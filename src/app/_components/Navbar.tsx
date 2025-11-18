// src/app/_components/Navbar.tsx
'use client';

import { useState, useEffect } from 'react';
import { createClient } from '@/app/lib/supabase/client';
import { User, AuthChangeEvent, Session } from '@supabase/supabase-js'; // ✅ Importa AuthChangeEvent

export default function Navbar() {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const supabase = createClient();

  useEffect(() => {
    const getInitialUser = async () => {
      try {
        const { data: { session } } = await supabase.auth.getSession();
        setUser(session?.user ?? null);
      } catch (error) {
        console.error('Navbar - Error:', error);
      } finally {
        setLoading(false);
      }
    };

    getInitialUser();

    // ✅ Añade tipo explícito a 'event'
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event: AuthChangeEvent, session: Session | null) => { // ✅ CORREGIDO
        console.log('Navbar - Auth event:', event, session?.user?.email);
        setUser(session?.user ?? null);
      }
    );

    return () => subscription.unsubscribe();
  }, []);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    window.location.href = '/';
  };

  return (
    <nav className="bg-white shadow-sm border-b">
      <div className="container mx-auto px-4">
        <div className="flex justify-between items-center h-16">
          <a href="/" className="flex items-center space-x-2">
            <span className="text-xl font-bold text-gray-800">IRPC</span>
            <span className="text-sm text-gray-600 hidden sm:inline">
              Índice Real de Precios
            </span>
          </a>

          <div className="flex items-center space-x-4">
            {loading ? (
              <div className="text-sm text-gray-500">Cargando...</div>
            ) : user ? (
              <>
                <span className="text-sm text-gray-600 hidden md:inline">
                  {user.email}
                </span>
                <a
                  href="/add-product"
                  className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700 transition-colors"
                >
                  Agregar Producto
                </a>
                <button
                  onClick={handleLogout}
                  className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 transition-colors"
                >
                  Cerrar Sesión
                </button>
              </>
            ) : (
              <>
                <a
                  href="/auth/login"
                  className="px-4 py-2 text-sm font-medium text-gray-700 hover:text-gray-900 transition-colors"
                >
                  Iniciar Sesión
                </a>
                <a
                  href="/auth/register"
                  className="px-4 py-2 text-sm font-medium text-white bg-green-600 rounded-md hover:bg-green-700 transition-colors"
                >
                  Registrarse
                </a>
              </>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
}