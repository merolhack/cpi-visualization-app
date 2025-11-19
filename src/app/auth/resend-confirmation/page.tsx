'use client';

import { useState, Suspense } from 'react';
import { createClient } from '@/app/lib/supabase/client';
import Link from 'next/link';

function ResendConfirmationContent() {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null);
  const supabase = createClient();

  const handleResend = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setMessage(null);

    try {
      const { error } = await supabase.auth.resend({
        type: 'signup',
        email,
        options: {
          emailRedirectTo: `${window.location.origin}/auth/login`,
        },
      });

      if (error) throw error;

      setMessage({
        type: 'success',
        text: 'Si el correo está registrado, recibirás un nuevo enlace de confirmación.'
      });
    } catch (error: any) {
      setMessage({
        type: 'error',
        text: error.message || 'Error al enviar el correo.'
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-md w-full bg-white rounded-lg shadow-md p-8">
      <div className="text-center mb-6">
        <h1 className="text-2xl font-bold text-gray-800">Reenviar Confirmación</h1>
        <p className="text-sm text-gray-600 mt-2">
          Ingresa tu correo para recibir un nuevo enlace de activación.
        </p>
      </div>

      {message && (
        <div className={`mb-4 p-3 rounded text-sm border ${
          message.type === 'success' 
            ? 'bg-green-100 border-green-400 text-green-700' 
            : 'bg-red-100 border-red-400 text-red-700'
        }`}>
          {message.text}
        </div>
      )}

      <form onSubmit={handleResend} className="space-y-4">
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
          />
        </div>

        <button
          type="submit"
          disabled={loading}
          className="w-full bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors font-medium"
        >
          {loading ? 'Enviando...' : 'Enviar enlace'}
        </button>
      </form>

      <div className="mt-6 pt-6 border-t border-gray-200 text-center">
        <Link href="/auth/login" className="text-sm text-blue-600 hover:underline">
          Volver al inicio de sesión
        </Link>
      </div>
    </div>
  );
}

export default function ResendConfirmationPage() {
  return (
    <main className="min-h-screen flex items-center justify-center bg-gray-50 p-4">
      <Suspense fallback={<div>Cargando...</div>}>
        <ResendConfirmationContent />
      </Suspense>
    </main>
  );
}
