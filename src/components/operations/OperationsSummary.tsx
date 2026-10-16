import {renewalData} from '@/lib/operations/renewals';
import {RenewalOverview} from './RenewalOverview';
import {requireAdmin} from '@/lib/admin-auth';
import {enabled} from '@/lib/operations/database';
import {overview,recentActivity} from '@/lib/operations/queries';
import {MetricGrid} from './MetricGrid';
import {ActivityList} from './ActivityList';
export async function OperationsSummary(){if(!enabled())return null;const actor=await requireAdmin();if(!actor)return null;const [summary,activity,renewals]=await Promise.all([overview(actor),recentActivity(actor),renewalData(actor)]);return <section className="mt-7"><RenewalOverview data={renewals}/><MetricGrid data={summary||{}} omitGroups={['Leases']}/><p className="mt-4 text-sm text-slate-600">An apartment without a current occupant needs review; it is not automatically vacant. Missing lease information is never an estimated rent.</p><ActivityList items={activity}/></section>;}
