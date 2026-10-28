import { RentRoll } from '@/components/operations/RentRoll';
import { notFound } from 'next/navigation';
import { enabled } from '@/lib/operations/database';
import { Directory } from '@/components/operations/Directory';
export const runtime='nodejs';
export default async function Page({params,searchParams}:{params:Promise<{entity:string}>;searchParams:Promise<{buildingId?:string;unitId?:string}>}){const {entity}=await params;if(!enabled()||!['properties','units','tenants','leases','superintendents','maintenance','rent-roll'].includes(entity))notFound();if(entity==='rent-roll')return <RentRoll/>;const filters=await searchParams;return <Directory entity={entity} buildingId={entity==='leases'?filters.buildingId||'':''} unitId={entity==='leases'?filters.unitId||'':''}/>;}
