import { currentTenant } from '@/lib/tenant-auth';
import { redirect } from 'next/navigation';
import Link from 'next/link';
import { TenantLogout } from '../tenant-logout';
export const runtime='edge';
export default async function TenantLayout({children}:{children:React.ReactNode}){const tenant=await currentTenant();if(!tenant)redirect('/tenant/login');return <div className="min-h-screen bg-slate-50 text-teams-ink"><header className="bg-teams-charcoal text-white"><div className="max-w-5xl mx-auto px-4 py-4 flex flex-wrap justify-between gap-3 items-center"><Link href="/tenant" className="font-serif text-xl">Teams Tenant Services</Link><nav aria-label="Tenant navigation" className="flex flex-wrap gap-4 text-sm"><Link href="/tenant">My Property</Link><Link href="/tenant/maintenance">Maintenance</Link><TenantLogout/></nav></div></header><main className="max-w-5xl mx-auto px-4 py-8">{children}</main></div>}
