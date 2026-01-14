import { Metadata } from 'next';
import { redirect } from 'next/navigation';
import { createClient } from '@/app/lib/supabase/server';
import AdminSidebar from '@/app/_components/AdminSidebar';

export const metadata: Metadata = {
  title: 'Panel de Administración - IRPC',
  description: 'Panel de control para administradores del sistema IRPC',
};

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const supabase = await createClient();

  const { data: { user }, error } = await supabase.auth.getUser();

  if (error || !user) {
    redirect('/auth/login?next=/admin');
  }

  // Verify user is an administrator
  const { data: userData, error: userError } = await supabase
    .from('cpi_users')
    .select('role')
    .eq('user_id', user.id)
    .single();

  const isAdmin = user.app_metadata?.claims_admin === true || userData?.role === 'admin';

  if (!isAdmin) {
    redirect('/?error=unauthorized');
  }

  return (
    <div className="flex min-h-screen bg-gray-50">
      <AdminSidebar />
      <main className="flex-1 overflow-auto">
        {children}
      </main>
    </div>
  );
}
