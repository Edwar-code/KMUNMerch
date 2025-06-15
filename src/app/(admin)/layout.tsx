import { redirect } from 'next/navigation';
import { Metadata } from 'next/types';
import Sidebar from '@/components/admin/Sidebar';
import { isAdmin } from '@/lib/auth-utils';
import { SidebarProvider } from '@/contexts/SidebarContext';
import Navbar from '@/components/admin/Navbar';

export const metadata: Metadata = {
  title: 'Admin Dashboard',
  description: 'Admin Area',
};

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const isAdminUser = await isAdmin();

  if (!isAdminUser) {
    redirect('/');
  }

  return (
    <SidebarProvider>
      <div>
        <Navbar />
        <Sidebar />
        <main className="pt-[50px]">
          {children}
        </main>
      </div>
    </SidebarProvider>
  );
}