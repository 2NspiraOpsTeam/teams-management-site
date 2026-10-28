// Header-based extraction: never confuse expiration with a missing move-in column.
const text=v=>v==null||v===''?null:v instanceof Date?v.toISOString().slice(0,10):String(v).trim()||null;
function sourceFields(row,headers){
 const at=name=>{const i=headers.findIndex(h=>String(h??'').trim().toUpperCase()===name);return i<0?null:text(row[i]);};
 const trailing=row.filter((v,i)=>i>headers.findIndex(h=>String(h??'').trim().toUpperCase()==='RENT')&&text(v)!=null);
 return {move_in_date:at('MOVE IN DATE'),rentredi:trailing.some(v=>/^rent\s*redi$/i.test(text(v)))?'RentRedi':null,utility_reimbursement:/^comm/i.test(at('STATUS')||'')?at('UTILITY REIMBURSEMENT'):null,additional_notes:trailing.filter(v=>!/^rent\s*redi$/i.test(text(v))).map(text).join(' · ')||null};
}
module.exports={sourceFields};
