import type { D1Database } from '@cloudflare/workers-types';
export type NotificationEnv={INQUIRY_NOTIFICATION_EMAIL?:string;INQUIRY_FROM_EMAIL?:string;RESEND_API_KEY?:string};
export async function attemptInquiryNotification(db:D1Database,env:NotificationEnv,id:string){
 const recipient=env.INQUIRY_NOTIFICATION_EMAIL?.trim(),sender=env.INQUIRY_FROM_EMAIL?.trim(),key=env.RESEND_API_KEY;
 if(!recipient||!sender||!key){await db.prepare("UPDATE inquiry_notifications SET state='pending', error_code='configuration_pending' WHERE inquiry_id=?").bind(id).run();return;}
 const claimed=await db.prepare("UPDATE inquiry_notifications SET state='unknown', destination=?, attempts=attempts+1, last_attempt_at=datetime('now'), error_code=NULL WHERE inquiry_id=? AND attempts=0 AND state='pending'").bind(recipient,id).run();
 if(!claimed.meta.changes)return;
 try{
  const response=await fetch('https://api.resend.com/emails',{method:'POST',headers:{Authorization:`Bearer ${key}`,'Content-Type':'application/json','Idempotency-Key':`teams-inquiry-${id}`},body:JSON.stringify({from:sender,to:[recipient],subject:'New Teams Management inquiry',text:`A new inquiry (${id}) is stored in the Teams Management admin inbox. Sign in to review it. No private inquiry content is included in this email.`})});
  if(response.ok){const result=await response.json() as {id?:string};await db.prepare("UPDATE inquiry_notifications SET state='sent',provider_id=?,error_code=NULL WHERE inquiry_id=?").bind(result.id||null,id).run();}
  else if(response.status>=400&&response.status<500){await db.prepare("UPDATE inquiry_notifications SET state='failed',error_code=? WHERE inquiry_id=?").bind(`provider_${response.status}`,id).run();}
  else await db.prepare("UPDATE inquiry_notifications SET state='unknown',error_code=? WHERE inquiry_id=?").bind(`provider_${response.status}`,id).run();
 }catch{await db.prepare("UPDATE inquiry_notifications SET state='unknown',error_code='network_unknown' WHERE inquiry_id=?").bind(id).run();}
}
