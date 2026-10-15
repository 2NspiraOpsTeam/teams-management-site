import { notFound } from 'next/navigation';
import { enabled } from '@/lib/operations/database';
import { Directory } from '@/components/operations/Directory';
export const runtime='nodejs';
export default function Page(){if(!enabled())notFound();return <Directory entity="superintendents"/>;}
