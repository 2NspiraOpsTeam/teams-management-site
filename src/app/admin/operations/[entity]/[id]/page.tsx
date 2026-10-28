import { notFound } from 'next/navigation';
import { enabled } from '@/lib/operations/database';
import { RecordDetail } from '@/components/operations/RecordDetail';
export const runtime='nodejs';
export default async function Page({params}:{params:Promise<{entity:string;id:string}>}){const {entity,id}=await params;if(!enabled()||!['units','tenants','leases','superintendents'].includes(entity))notFound();return <RecordDetail entity={entity} id={id}/>;}
