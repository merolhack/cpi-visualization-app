// src/app/_components/LogoutButton.tsx
'use client';

import { useRouter } from 'next/navigation';
import { createClient } from '@/app/lib/supabase/client';  // ✅ Cambiar
import { useState } from 'react';

export default function LogoutButton() {
  const router = useRouter();
  const supabase = createClient();  // ✅ Sin await
  const [loading, setLoading] = useState(false);

  const handleLogout = async () => {
    setLoading(true);
    try {
      await supabase.auth.signOut();
      window.location.href = '/auth/login';  // ✅ Forzar recarga
    } catch (error) {
      console.error('Error al cerrar sesión:', error);
      setLoading(false);
    }
  };

  return (
    <button
      onClick={handleLogout}
      disabled={loading}
      className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
    >
      {loading ? 'Cerrando sesión...' : 'Cerrar Sesión'}
    </button>
  );
}