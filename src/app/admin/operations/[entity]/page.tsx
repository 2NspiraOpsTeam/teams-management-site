import { RentRoll } from '@/components/operations/RentRoll';
import { notFound } from 'next/navigation';
import { enabled } from '@/lib/operations/database';
import { Directory } from '@/components/operations/Directory';
export const runtime='nodejs';
export default async function Page({params}:{params:Promise<{entity:string}>}){const {entity}=await params;if(!enabled()||!['properties','units','tenants','leases','superintendents','maintenance','rent-roll'].includes(entity))notFound();if(entity==='rent-roll')return <RentRoll/>;return <Directory entity={entity}/>;}
