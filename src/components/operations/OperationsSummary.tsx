import {requireAdmin} from '@/lib/admin-auth';
import {enabled} from '@/lib/operations/database';
import {overview,recentActivity} from '@/lib/operations/queries';
import {MetricGrid} from './MetricGrid';
import {ActivityList} from './ActivityList';
export async function OperationsSummary(){if(!enabled())return null;const actor=await requireAdmin();if(!actor)return null;const [summary,activity]=await Promise.all([overview(actor),recentActivity(actor)]);return <section className="mt-7"><MetricGrid data={summary||{}}/><p className="mt-4 text-sm text-slate-600">An apartment without a current occupant needs review; it is not automatically vacant. Missing lease information is never an estimated rent.</p><ActivityList items={activity}/></section>;}
