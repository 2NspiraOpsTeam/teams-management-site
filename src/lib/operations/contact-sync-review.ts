// Offline change proposals only. No Graph tokens, HTTP calls or database writes.
const fields=['tenant_name','email','phone'] as const;
export type ContactField=typeof fields[number];
export type SourceApproval={sourceVerified:boolean;sourceAuthorityApproved:boolean;propertyMappingsApproved:boolean;approvedFields:ContactField[];driveId:string;itemId:string};
export function proposeContactChanges(approval:SourceApproval,before:Record<string,string>,after:Record<string,string>){
 if(!approval.sourceVerified||!approval.sourceAuthorityApproved||!approval.propertyMappingsApproved||!approval.driveId||!approval.itemId)throw Error('Source authority and property approval are required.');
 if(approval.approvedFields.some(f=>!fields.includes(f)))throw Error('Only explicitly approved contact fields are supported.');
 return approval.approvedFields.filter(f=>after[f]!==undefined&&after[f]!==before[f]).map(field=>({field,before:before[field]??null,proposed:after[field],status:'review_required' as const}));
}
