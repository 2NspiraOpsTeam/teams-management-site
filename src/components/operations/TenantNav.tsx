'use client';
import Link from 'next/link';
import {usePathname} from 'next/navigation';
export function TenantNav(){const path=usePathname();return <nav aria-label="Tenant views" className="mb-6 flex gap-2 overflow-x-auto border-b pb-3">{[['Tenant Directory','/admin/tenants'],['Phone List','/admin/tenants/phone-list'],['Import / Upload','/admin/tenants/import']].map(([name,to])=><Link prefetch={false} key={to} href={to} aria-current={path===to?'page':undefined} className={'inline-flex min-h-11 shrink-0 items-center rounded px-4 py-2 text-sm font-medium '+(path===to?'bg-teams-ink text-white':'bg-white underline underline-offset-4')}>{name}</Link>)}</nav>;}
