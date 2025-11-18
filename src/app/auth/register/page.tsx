// src/app/auth/register/page.tsx
'use client';

import { useState, useEffect, Suspense } from 'react';
import { createClient } from '@/app/lib/supabase/client';
import { useRouter, useSearchParams } from 'next/navigation';

// Mapeo de errores amigables
const AUTH_ERROR_MESSAGES: Record<string, string> = {
  'User already registered': 'Este correo electrónico ya está registrado.',
  'Email rate limit exceeded': 'Demasiados intentos. Por favor espera unos minutos.',
  'Password should be at least 6 characters': 'La contraseña debe tener al menos 6 caracteres.',
  'Invalid email': 'Por favor ingresa un correo electrónico válido.',
  'Email not confirmed': 'Por favor confirma tu correo electrónico.',
};

// ✅ Componente que usa los hooks (requiere Suspense)
function RegisterFormContent() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  
  const router = useRouter();
  const supabase = createClient();

  const getErrorMessage = (error: any): string => {
    // Si el error tiene un código conocido
    if (error.error_code) {
      switch (error.error_code) {
        case 'EMAIL_EXISTS':
        case 'USER_EXISTS':
        case 'DUPLICATE_ENTRY':
          return 'Este correo electrónico ya está registrado. ¿Olvidaste tu contraseña?';
        case 'INVALID_NAME':
          return 'Por favor ingresa un nombre válido (mínimo 2 caracteres).';
        case 'SYSTEM_ERROR':
          return 'Ocurrió un error inesperado. Por favor intenta más tarde.';
        default:
          return 'Error al procesar el registro. Por favor intenta nuevamente.';
      }
    }

    // Errores de autenticación de Supabase
    const message = error.message || '';
    
    // Buscar mensaje conocido
    for (const [key, value] of Object.entries(AUTH_ERROR_MESSAGES)) {
      if (message.includes(key)) {
        return value;
      }
    }

    // Ocultar errores técnicos de base de datos
    if (message.includes('duplicate key') || 
        message.includes('violates') || 
        message.includes('constraint') ||
        message.includes('SQL') ||
        message.includes('database')) {
      return 'Este correo electrónico ya está registrado. ¿Olvidaste tu contraseña?';
    }

    // Mensaje genérico para errores no identificados
    return 'Ocurrió un error al registrarte. Por favor intenta más tarde.';
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setSuccess(false);

    try {
      // Validaciones del lado del cliente
      if (name.trim().length < 2) {
        throw new Error('El nombre debe tener al menos 2 caracteres.');
      }

      if (password.length < 6) {
        throw new Error('La contraseña debe tener al menos 6 caracteres.');
      }

      // Paso 1: Crear usuario en auth.users
      const { data: authData, error: signUpError } = await supabase.auth.signUp({
        email,
        password,
        options: {
          emailRedirectTo: `${window.location.origin}/auth/login`,
        }
      });

      if (signUpError) {
        throw signUpError;
      }

      if (!authData.user) {
        throw new Error('No se pudo crear el usuario.');
      }

      // Paso 2: Llamar a la función RPC para completar el registro
      const { data: registerResult, error: registerError } = await supabase.rpc(
        'register_volunteer',
        {
          p_user_id: authData.user.id,
          p_email: authData.user.email || email,
          p_name: name.trim(),
          p_country_id: 1, // México por defecto
        }
      );

      if (registerError) {
        throw registerError;
      }

      // Verificar la respuesta de la función RPC
      if (registerResult && !registerResult.success) {
        throw { error_code: registerResult.error_code, message: registerResult.message };
      }

      setSuccess(true);

      // Redirigir después de 2 segundos
      setTimeout(() => {
        window.location.href = '/auth/login?message=Registro exitoso. Por favor inicia sesión.';
      }, 2000);

    } catch (err: any) {
      console.error('Error en registro:', err);
      setError(getErrorMessage(err));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-md w-full bg-white rounded-lg shadow-md p-8">
      <h1 className="text-2xl font-bold mb-6 text-center text-gray-800">
        Registrarse como Voluntario
      </h1>
      
      {error && (
        <div className="mb-4 p-3 bg-red-100 border border-red-400 text-red-700 rounded text-sm">
          <p className="font-medium">{error}</p>
          {error.includes('ya está registrado') && (
            <a 
              href="/auth/reset-password" 
              className="text-xs underline mt-1 inline-block"
            >
              Recuperar contraseña
            </a>
          )}
        </div>
      )}

      {success && (
        <div className="mb-4 p-3 bg-green-100 border border-green-400 text-green-700 rounded text-sm">
          <p className="font-medium">¡Registro exitoso!</p>
          <p className="text-xs mt-1">Redirigiendo al inicio de sesión...</p>
        </div>
      )}

      <form onSubmit={handleRegister} className="space-y-4">
        <div>
          <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">
            Nombre Completo *
          </label>
          <input
            id="name"
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="Juan Pérez"
            required
            minLength={2}
            disabled={loading || success}
          />
        </div>

        <div>
          <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
            Correo Electrónico *
          </label>
          <input
            id="email"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="tu@email.com"
            required
            disabled={loading || success}
          />
        </div>

        <div>
          <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-1">
            Contraseña *
          </label>
          <input
            id="password"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="Mínimo 6 caracteres"
            required
            minLength={6}
            disabled={loading || success}
          />
          <p className="text-xs text-gray-500 mt-1">
            Mínimo 6 caracteres
          </p>
        </div>

        <button
          type="submit"
          disabled={loading || success}
          className="w-full bg-green-600 text-white py-2 px-4 rounded-md hover:bg-green-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors font-medium"
        >
          {loading ? 'Registrando...' : success ? '¡Registro Exitoso!' : 'Registrarse'}
        </button>
      </form>

      <p className="mt-6 text-center text-sm text-gray-600">
        ¿Ya tienes cuenta?{' '}
        <a href="/auth/login" className="text-blue-600 hover:underline font-medium">
          Inicia sesión aquí
        </a>
      </p>

      <div className="mt-6 pt-6 border-t border-gray-200">
        <p className="text-xs text-gray-500 text-center">
          Al registrarte, aceptas contribuir voluntariamente al sistema de seguimiento de precios.
        </p>
      </div>
    </div>
  );
}

// ✅ Componente principal con Suspense boundary
export default function RegisterPage() {
  return (
    <main className="min-h-screen flex items-center justify-center bg-gray-50 p-4">
      <Suspense fallback={
        <div className="max-w-md w-full bg-white rounded-lg shadow-md p-8 text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Cargando formulario de registro...</p>
        </div>
      }>
        <RegisterFormContent />
      </Suspense>
    </main>
  );
}