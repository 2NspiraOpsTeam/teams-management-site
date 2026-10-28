import { PortalBrand } from '@/components/PortalBrand';
import { ResidentNavigation } from '@/components/ResidentNavigation';
import { tenantLeasesEnabled } from '@/lib/operations/tenant-leases';
import { currentTenant } from '@/lib/tenant-auth';
import { redirect } from 'next/navigation';
import { TenantLogout } from '../tenant-logout';
import type { Metadata } from 'next';
export const runtime='nodejs';
export const metadata: Metadata = { title:'Your home | Teams Management',robots: { index: false, follow: false } };
export default async function TenantLayout({children}:{children:React.ReactNode}){const tenant=await currentTenant();if(!tenant)redirect('/tenant/login');return <div className="resident-shell"><header className="resident-header"><div className="resident-header-top"><PortalBrand href="/tenant" label="Resident living" inverse/><div className="resident-header-right"><span className="resident-private">Your private resident portal</span><TenantLogout/></div></div><ResidentNavigation lease={tenantLeasesEnabled()}/></header><main id="main-content" className="resident-main">{children}</main><footer className="resident-footer"><span>Teams Management</span><span>A place to call home.</span></footer></div>}
