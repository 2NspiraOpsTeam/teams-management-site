import { notFound } from 'next/navigation';
import { enabled } from '@/lib/operations/database';
import { PropertyDashboard } from '@/components/operations/PropertyDashboard';
export const runtime='nodejs';
export default async function Page({params}:{params:Promise<{id:string}>}){if(!enabled())notFound();return <PropertyDashboard id={(await params).id}/>;}
