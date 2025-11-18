// src/app/auth/login/page.tsx
'use client';

import { useState, useEffect } from 'react';
import { createClient } from '@/app/lib/supabase/client';  // ✅ Usar tu cliente
import { useRouter, useSearchParams } from 'next/navigation';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);
  
  const router = useRouter();
  const searchParams = useSearchParams();
  const supabase = createClient();  // ✅ Sin await, es cliente

  useEffect(() => {
    const msg = searchParams.get('message');
    if (msg) {
      setMessage(decodeURIComponent(msg));
    }
  }, [searchParams]);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setMessage(null);

    try {
      const { data, error: signInError } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (signInError) {
        if (signInError.message.includes('Invalid login credentials')) {
          setError('Correo o contraseña incorrectos. Por favor verifica tus datos.');
        } else if (signInError.message.includes('Email not confirmed')) {
          setError('Por favor confirma tu correo electrónico antes de iniciar sesión.');
        } else {
          setError('Error al iniciar sesión. Por favor intenta nuevamente.');
        }
        setLoading(false);
        return;
      }

      if (data.user) {
        console.log('Login exitoso, redirigiendo...', data.user.email);
        
        // Obtener la URL de redirección
        const nextUrl = searchParams.get('next') || '/add-product';
        console.log('URL de redirección:', nextUrl);
        
        // Esperar un momento para que se guarde la sesión
        await new Promise(resolve => setTimeout(resolve, 500));
        
        // Redirigir
        window.location.href = nextUrl;  // ✅ Usar window.location para forzar recarga
      }
    } catch (err: any) {
      console.error('Error inesperado:', err);
      setError('Ocurrió un error inesperado. Por favor intenta más tarde.');
      setLoading(false);
    }
  };

  return (
    <main className="min-h-screen flex items-center justify-center bg-gray-50 p-4">
      <div className="max-w-md w-full bg-white rounded-lg shadow-md p-8">
        <div className="text-center mb-6">
          <h1 className="text-2xl font-bold text-gray-800">
            Iniciar Sesión
          </h1>
          <p className="text-sm text-gray-600 mt-2">
            Sistema IRPC - Voluntarios
          </p>
        </div>
        
        {message && (
          <div className="mb-4 p-3 bg-green-100 border border-green-400 text-green-700 rounded text-sm">
            {message}
          </div>
        )}

        {error && (
          <div className="mb-4 p-3 bg-red-100 border border-red-400 text-red-700 rounded text-sm">
            {error}
          </div>
        )}

        <form onSubmit={handleLogin} className="space-y-4">
          <div>
            <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
              Correo Electrónico
            </label>
            <input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="tu@email.com"
              required
              disabled={loading}
              autoComplete="email"
            />
          </div>

          <div>
            <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-1">
              Contraseña
            </label>
            <input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Tu contraseña"
              required
              disabled={loading}
              autoComplete="current-password"
            />
          </div>

          <div className="text-right">
            <a 
              href="/auth/reset-password" 
              className="text-xs text-blue-600 hover:underline"
            >
              ¿Olvidaste tu contraseña?
            </a>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors font-medium"
          >
            {loading ? 'Ingresando...' : 'Ingresar'}
          </button>
        </form>

        <div className="mt-6 pt-6 border-t border-gray-200">
          <p className="text-center text-sm text-gray-600">
            ¿No tienes cuenta?{' '}
            <a href="/auth/register" className="text-blue-600 hover:underline font-medium">
              Regístrate aquí
            </a>
          </p>
        </div>
      </div>
    </main>
  );
}