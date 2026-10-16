import { AdminShell } from '@/components/admin/AdminShell';
import { redirect } from 'next/navigation';
import { currentAdmin } from '@/lib/admin-auth';

import type { Metadata } from 'next';
export const runtime = 'nodejs';
export const metadata: Metadata = { robots: { index: false, follow: false } };
export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  if (!(await currentAdmin())) redirect('/access');
  return <AdminShell>{children}</AdminShell>;
}
