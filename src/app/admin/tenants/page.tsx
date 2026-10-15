import Link from 'next/link';
import TenantAccess from '@/components/admin/TenantAccess';
import { enabled } from '@/lib/operations/database';
import { Directory } from '@/components/operations/Directory';
export const runtime='nodejs';
export default function Page(){return <><div className="px-4 pt-4 sm:px-8"><Link className="inline-flex min-h-11 items-center underline" href="/admin/tenants/import-review">Import Review</Link><p>407 candidates awaiting review — import disabled.</p></div>{enabled()?<Directory entity="tenants"/>:<TenantAccess/>}</>;}
