import {notFound} from 'next/navigation';
import {enabled} from '@/lib/operations/database';
import {PhoneList} from '@/components/operations/PhoneList';
export const runtime='nodejs';
export default function Page(){if(!enabled())notFound();return <PhoneList/>;}
