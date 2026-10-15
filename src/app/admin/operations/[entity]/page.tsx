import { notFound } from 'next/navigation';
import { enabled } from '@/lib/operations/database';
import { Directory } from '@/components/operations/Directory';
export const runtime='nodejs';
export default async function Page({params}:{params:Promise<{entity:string}>}){const {entity}=await params;if(!enabled()||!['properties','units','tenants','leases','superintendents','maintenance'].includes(entity))notFound();return <Directory entity={entity}/>;}
