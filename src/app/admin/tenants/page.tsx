import TenantAccess from '@/components/admin/TenantAccess';
import { enabled } from '@/lib/operations/database';
import { Directory } from '@/components/operations/Directory';
export const runtime='nodejs';
export default function Page(){return enabled()?<Directory entity="tenants"/>:<TenantAccess/>;}
