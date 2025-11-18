// src/app/lib/supabase/middleware.ts
import { createServerClient, type CookieOptions } from '@supabase/ssr';
import { NextResponse, type NextRequest } from 'next/server';

export async function updateSession(request: NextRequest) {
  let response = NextResponse.next({ request: { headers: request.headers } });

  // ✅ Hacer el cliente async
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        get(name: string) {
          return request.cookies.get(name)?.value;
        },
        set(name: string, value: string, options: CookieOptions) {
          request.cookies.set({ name, value, ...options });
          response = NextResponse.next({ request: { headers: request.headers } });
          response.cookies.set({ name, value, ...options });
        },
        remove(name: string, options: CookieOptions) {
          request.cookies.set({ name, value: '', ...options });
          response = NextResponse.next({ request: { headers: request.headers } });
          response.cookies.set({ name, value: '', ...options });
        },
      },
    }
  );

  // Refrescar sesión
  const { data: { user }, error } = await supabase.auth.getUser();

  // Rutas protegidas
  const protectedPaths = ['/add-product', '/dashboard', '/volunteer'];
  const isProtected = protectedPaths.some(path => 
    request.nextUrl.pathname.startsWith(path)
  );

  // Rutas públicas
  const authPaths = ['/auth/login', '/auth/register'];
  const isAuthPath = authPaths.some(path => 
    request.nextUrl.pathname.startsWith(path)
  );

  // Redirigir si intenta acceder a ruta protegida sin sesión
  if (isProtected && !user) {
    return NextResponse.redirect(
      new URL(`/auth/login?next=${request.nextUrl.pathname}`, request.url)
    );
  }

  // Redirigir si ya está autenticado y va a login/register
  if (isAuthPath && user) {
    return NextResponse.redirect(new URL('/add-product', request.url));
  }

  return response;
}