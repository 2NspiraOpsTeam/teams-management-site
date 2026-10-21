'use client';
import {button,type RecordRow} from './shared';

export function TenantAccess({data,busy,onInvite,onRevoke}:{data:RecordRow;busy:boolean;onInvite:()=>void;onRevoke:()=>void}){
 const reason=!data.email?'A login email is required. Directory contact emails do not enable sign-in.':!data.active?'Tenant access must be enabled before sending an invitation.':!data.invitation_has_assignment?'Assign a current apartment before sending an invitation.':'';
 return <section className="mb-6 rounded border bg-white p-5" aria-labelledby="tenant-access-heading">
 <h2 id="tenant-access-heading" className="text-xl font-semibold">Tenant Services access</h2>
 <p className="my-3">Invitation: {data.invitation?'Last sent '+data.invitation.created_at:'Not sent yet'}</p>
 <p className="mb-3 break-words text-sm">Sign-in email: {data.email||'Not set'}</p>
 <div className="flex flex-wrap gap-3"><button className={button} disabled={busy||!!reason} aria-describedby="tenant-invite-help" onClick={onInvite}>{busy?'Please wait…':data.invitation?'Resend invitation':'Send invitation'}</button><button className={button} disabled={busy} onClick={onRevoke}>Revoke sessions</button></div>
 <p id="tenant-invite-help" className="mt-3 text-sm text-slate-600">{reason||'Sends a sign-in link to this login email. The tenant requests a one-time code to sign in. No account or apartment access is changed.'}</p>
 <p className="mt-2 text-sm text-slate-600">Invitations are sent only when you confirm. No automatic invitations or activations.</p>
 </section>;
}
