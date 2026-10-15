import Link from 'next/link';
import { OperationsSummary } from '@/components/operations/OperationsSummary';
export const runtime='nodejs';
export default async function AdminHome(){return <main id="main-content" className="mx-auto max-w-4xl p-6"><h1 className="text-3xl font-semibold">Teams Admin</h1><p className="mt-3 text-slate-600">Manage property details, approved imagery, homepage visuals, inquiries, and tenant access.</p><OperationsSummary/><div className="mt-7 grid gap-4 sm:grid-cols-2">{[['Properties','/admin/properties'],['Media','/admin/media'],['Maintenance','/admin/maintenance'],['Tenant Access','/admin/tenants']].map(([name,href])=><Link key={href} href={href} className="rounded border bg-white p-5 font-semibold hover:border-amber-500">{name} →</Link>)}</div></main>}
