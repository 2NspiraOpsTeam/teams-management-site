import {currentTenant,tenantDb} from '@/lib/tenant-auth';
import {householdAssignments,householdRequests} from '@/lib/household/server';
import {HouseholdRequests} from '@/components/HouseholdRequests';
export const runtime='nodejs';
export default async function Household(){const t=await currentTenant();if(!t)return null;const db=tenantDb();const [a,r]=await Promise.all([householdAssignments(db,t.id),householdRequests(db,t.id)]);return <><div className="resident-page-heading"><p className="resident-eyebrow">Your people. Your place.</p><h1>Household & access</h1><p>Individual sign-ins. One place to feel at home.</p></div><HouseholdRequests initial={r.results} assignments={a.results}/></>;}
