import Link from 'next/link';
import { redirect } from 'next/navigation';
import { currentAdmin } from '@/lib/admin-auth';
import LogoutButton from '@/components/admin/LogoutButton';
export const runtime = 'edge';
const links=[['Dashboard','/admin'],['Properties','/admin/buildings'],['Homepage','/admin/homepage'],['Media Library','/admin/media'],['Inquiries','/admin/inquiries']];
export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  if (!(await currentAdmin())) redirect('/access');
  return <div className="min-h-screen bg-stone-50 text-slate-900"><nav aria-label="Admin" className="flex flex-wrap gap-x-5 gap-y-2 border-b border-stone-200 bg-white px-4 py-4 sm:px-8">{links.map(([label,href])=><Link key={href} href={href} className="inline-flex min-h-11 items-center font-medium hover:underline">{label}</Link>)}<LogoutButton /></nav>{children}</div>;
}
