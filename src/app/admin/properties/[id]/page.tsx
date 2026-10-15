import { PropertyDashboard } from '@/components/operations/PropertyDashboard';
export const runtime='nodejs';
export default async function Property({params}:{params:Promise<{id:string}>}){return <PropertyDashboard id={(await params).id}/>;}
