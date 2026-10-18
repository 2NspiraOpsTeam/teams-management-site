// Request-local counters: never log SQL text, bound values, cookies, or records.
export function meterDatabase(database, report) {
 const originals = new WeakMap();
 const fingerprints = new WeakMap();
 const fingerprint = sql => {let hash=2166136261;for(const c of sql)hash=Math.imul(hash^c.charCodeAt(0),16777619);return (hash>>>0).toString(16);};
 const record = (result,query) => {
  const results = Array.isArray(result) ? result : [result];
  for (const item of results) if (item?.meta) {
   report.queries++;
   if(typeof item.meta.rows_read==='number'&&typeof item.meta.rows_written==='number')report.measuredQueries=(report.measuredQueries||0)+1;
   report.rowsRead += Number(item.meta.rows_read || 0);
   report.rowsWritten += Number(item.meta.rows_written || 0);
   report.durationMs += Number(item.meta.duration || 0);
   if(query){report.costs??={};const cost=report.costs[query]??={queries:0,rowsRead:0,rowsWritten:0};cost.queries++;cost.rowsRead+=Number(item.meta.rows_read||0);cost.rowsWritten+=Number(item.meta.rows_written||0);}
  }
  return result;
 };
 const attempt=async task=>{try{return await task();}catch(e){report.failedQueries=(report.failedQueries||0)+1;throw e;}};
 const statement = (raw,query) => {
  const wrapped = new Proxy(raw, {get(target, key) {
   if (key === 'bind') return (...values) => statement(target.bind(...values),query);
   if (key === 'first') return async column => {
    const result = record(await attempt(()=>target.all()),query);
    const row = result.results?.[0] ?? null;
    if (column === undefined) return row;
    if (row === null) return null;
    if (!(column in row)) throw new Error('D1 column not found');
    return row[column];
   };
   if (key === 'all' || key === 'run') return async (...args) => record(await attempt(()=>target[key](...args)),query);
   const value = Reflect.get(target, key, target);
   return typeof value === 'function' ? value.bind(target) : value;
  }});
  originals.set(wrapped,raw);fingerprints.set(wrapped,query);return wrapped;
 };
 return new Proxy(database,{get(target,key){
  if(key==='prepare')return sql=>statement(target.prepare(sql),fingerprint(sql));
  if(key==='batch')return async statements=>{const results=await attempt(()=>target.batch(statements.map(s=>originals.get(s)||s)));results.forEach((r,i)=>record(r,fingerprints.get(statements[i])));return results;};
  if(key==='withSession')return (...args)=>meterDatabase(target.withSession(...args),report);
  const value=Reflect.get(target,key,target);return typeof value==='function'?value.bind(target):value;
 }});
}
