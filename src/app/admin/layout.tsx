import { notFound } from 'next/navigation';
import { currentAdmin } from '@/lib/admin-auth';
export const runtime = 'edge';
export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  if (!(await currentAdmin())) notFound();
  return <>{children}</>;
}
