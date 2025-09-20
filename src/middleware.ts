// src/middleware.ts
import { updateSession } from '@/app/lib/supabase/middleware'
import { type NextRequest } from 'next/server'

export async function middleware(request: NextRequest) {
  console.log('[Middleware] Ejecutando para la ruta:', request.nextUrl.pathname);
  try {
    return await updateSession(request);
  } catch (e) {
    console.error('[Middleware] Error al actualizar la sesión:', e);
    // Devuelve una respuesta para evitar que la petición se quede colgada
    return new Response("Error interno del servidor", { status: 500 });
  }
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * Feel free to modify this pattern to include more paths.
     */
    '/((?!_next/static|_next/image|favicon.ico).*)',
  ],
}