// Rate estimates use fresh provider totals only, never retained/missing samples.
// No extra queries, scans, or automatic service shutdowns.
function readRate(current,prior={}) {
 const now=Date.parse(current.at),value=current.metrics?.rowsRead;
 let sample=prior.readSample,noticeAt=prior.readRateNoticeAt,previousLevel=prior.readRateLevel||0,level=0,message='';
 if(sample?.day!==current.day){sample=undefined;noticeAt=undefined;previousLevel=0;}
 if(Number.isFinite(value)&&Number.isFinite(now)){
  const elapsed=now-Date.parse(sample?.at),delta=value-(sample?.value??value);
  if(sample&&elapsed>=900000&&elapsed<=7200000&&delta>=0){
   const perHour=delta*3600000/elapsed;
   level=perHour>=1000000?2:perHour>=500000?1:0;
   if(level&&(!noticeAt||now-noticeAt>=3600000||level>previousLevel)){
    message=`Database read-rate warning: approximately ${Math.round(perHour).toLocaleString()} rows/hour since the last fresh sample; provider reporting can lag. Investigate expensive queries and pause nonessential QA.`;
    noticeAt=now;
   }
  }
  // Keep an older fresh sample through rapid/manual checks until 15 minutes elapse.
  if(!sample||elapsed>=900000||delta<0)sample={day:current.day,at:current.at,value};
 }
 return {message,state:{readSample:sample,readRateNoticeAt:noticeAt,readRateLevel:level||previousLevel}};
}
module.exports={readRate};
