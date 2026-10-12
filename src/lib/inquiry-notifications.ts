import type { D1Database } from '@cloudflare/workers-types';
import { MailService, type MailEnv } from './mail-service';
export type NotificationEnv = MailEnv;
export async function attemptInquiryNotification(db:D1Database,env:NotificationEnv,id:string){
 const recipient=env.INQUIRY_NOTIFICATION_EMAIL?.trim(),sender=env.INQUIRY_FROM_EMAIL?.trim(),mail=new MailService(env);
 if(!recipient||!sender||!mail.configured()){await db.prepare("UPDATE inquiry_notifications SET state='pending', error_code='configuration_pending' WHERE inquiry_id=?").bind(id).run();return;}
 const claimed=await db.prepare("UPDATE inquiry_notifications SET state='unknown', destination=?, attempts=attempts+1, last_attempt_at=datetime('now'), error_code=NULL WHERE inquiry_id=? AND attempts=0 AND state='pending'").bind(recipient,id).run();
 if(!claimed.meta.changes)return;
 try{
  const providerId=await mail.sendInquiryNotification(recipient,id);
  await db.prepare("UPDATE inquiry_notifications SET state='sent',provider_id=?,error_code=NULL WHERE inquiry_id=?").bind(providerId,id).run();
 }catch{await db.prepare("UPDATE inquiry_notifications SET state='unknown',error_code='network_unknown' WHERE inquiry_id=?").bind(id).run();}
}
