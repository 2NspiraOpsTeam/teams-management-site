import { enabled } from '@/lib/operations/database';
import { Directory } from '@/components/operations/Directory';
import LegacyUnits from '@/components/admin/LegacyUnits';
export const runtime='nodejs';
export default function Page(){return enabled()?<Directory entity="units"/>:<LegacyUnits/>;}
