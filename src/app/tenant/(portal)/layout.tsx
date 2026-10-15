import { availableTenantLease } from '@/lib/operations/tenant-leases';
import { currentTenant } from '@/lib/tenant-auth';
import { redirect } from 'next/navigation';
import Link from 'next/link';
import { TenantLogout } from '../tenant-logout';
import type { Metadata } from 'next';
export const runtime='nodejs';
export const metadata: Metadata = { robots: { index: false, follow: false } };
export default async function TenantLayout({children}:{children:React.ReactNode}){const tenant=await currentTenant();if(!tenant)redirect('/tenant/login');return <div className="min-h-screen bg-slate-50 text-teams-ink"><header className="bg-teams-charcoal text-white"><div className="max-w-5xl mx-auto px-4 py-4 flex flex-wrap justify-between gap-3 items-center"><Link prefetch={false} href="/tenant" className="font-serif text-xl">Teams Tenant Services</Link><nav aria-label="Tenant navigation" className="flex flex-wrap gap-4 text-sm"><Link prefetch={false} href="/tenant">My Apartment</Link>{await availableTenantLease(tenant.id)&&<Link prefetch={false} href="/tenant/lease">My Lease</Link>}<Link prefetch={false} href="/tenant/maintenance">Maintenance Requests</Link><Link prefetch={false} href="/tenant/contact">Contact Management</Link><TenantLogout/></nav></div></header><main id="main-content" className="max-w-5xl mx-auto px-4 py-8">{children}</main></div>}
