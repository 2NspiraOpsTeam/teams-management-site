import {renewalData} from '@/lib/operations/renewals';
import {RenewalOverview} from './RenewalOverview';
import {requireAdmin} from '@/lib/admin-auth';
import {enabled} from '@/lib/operations/database';
import {overview,recentActivity} from '@/lib/operations/queries';
import {MetricGrid} from './MetricGrid';
import {ActivityList} from './ActivityList';
export async function OperationsSummary(){if(!enabled())return null;const actor=await requireAdmin();if(!actor)return null;const [summary,activity,renewals]=await Promise.all([overview(actor),recentActivity(actor),renewalData(actor)]);return <section className="dashboard-operations"><RenewalOverview data={renewals}/><MetricGrid data={summary||{}} omitGroups={['Leases']}/><p className="dashboard-data-note text-xs text-slate-600">An apartment without a current occupant needs review; it is not automatically vacant. Missing lease information is never an estimated rent.</p><details className="dashboard-activity"><summary className="cursor-pointer py-2 text-sm font-medium">Recent operational activity <span className="text-slate-500">({activity.length})</span></summary><ActivityList items={activity}/></details></section>;}
