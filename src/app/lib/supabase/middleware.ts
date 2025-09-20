// src/app/lib/supabase/middleware.ts
import { createServerClient, type CookieOptions } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'

export async function updateSession(request: NextRequest) {
  let response = NextResponse.next({
    request: {
      headers: request.headers,
    },
  })

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        get(name: string) {
          return request.cookies.get(name)?.value
        },
        set(name: string, value: string, options: CookieOptions) {
          request.cookies.set({
            name,
            value,
            ...options,
          })
          response = NextResponse.next({
            request: {
              headers: request.headers,
            },
          })
          response.cookies.set({
            name,
            value,
            ...options,
          })
        },
        remove(name: string, options: CookieOptions) {
          request.cookies.set({
            name,
            value: '',
            ...options,
          })
          response = NextResponse.next({
            request: {
              headers: request.headers,
            },
          })
          response.cookies.set({
            name,
            value: '',
            ...options,
          })
        },
      },
    }
  )

  // Refresca la sesión del usuario (esto es crucial)
  console.log('[Middleware-Util] Intentando obtener el usuario para refrescar la sesión...');
  const { data: { user }, error } = await supabase.auth.getUser();

  if (error) {
    console.error('[Middleware-Util] Error al obtener el usuario:', error.message);
  } else if (!user) {
    console.warn('[Middleware-Util] No se encontró un usuario en la sesión. La petición será anónima.');
  } else {
    console.log('[Middleware-Util] Sesión refrescada exitosamente para el usuario:', user.email);
  }

  return response
}