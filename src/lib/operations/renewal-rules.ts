export const renewalDefaults={reminderDays:[90,60,30],statuses:[
 {key:'not_started',label:'Not Started',inProgress:false},{key:'review_needed',label:'Review Needed',inProgress:false},
 {key:'notice_prepared',label:'Notice Prepared',inProgress:true},{key:'notice_sent',label:'Notice Sent',inProgress:true},
 {key:'tenant_responded',label:'Tenant Responded',inProgress:true},{key:'in_progress',label:'Renewal in Progress',inProgress:true},
 {key:'renewed',label:'Renewed',inProgress:false},{key:'not_renewing',label:'Non-Renewal / Move-Out',inProgress:false}
]};
export function calendarDate(value:unknown):string|null{if(typeof value!=='string'||!/^\d{4}-\d{2}-\d{2}$/.test(value))return null;const d=new Date(value+'T00:00:00Z');return Number.isFinite(+d)&&d.toISOString().slice(0,10)===value&&value>='1900-01-01'&&value<='2200-12-31'?value:null;}
export const businessDate=()=>new Intl.DateTimeFormat('en-CA',{timeZone:'America/New_York',year:'numeric',month:'2-digit',day:'2-digit'}).format(new Date());
export const daysBetween=(end:string,today:string)=>Math.round((Date.parse(end+'T00:00:00Z')-Date.parse(today+'T00:00:00Z'))/86400000);
export const isMonthToMonth=(v:unknown)=>typeof v==='string'&&/^(?:month\s*(?:-?to-?|\/)\s*month|month\s*[-/]\s*month|m\s*\/\s*m)$/i.test(v.trim());
export function monthKeys(today:string){const d=new Date(today.slice(0,7)+'-01T00:00:00Z');return Array.from({length:12},(_,i)=>new Date(Date.UTC(d.getUTCFullYear(),d.getUTCMonth()+i,1)).toISOString().slice(0,7));}
