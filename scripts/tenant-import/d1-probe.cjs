// Run only with the local-only D1 harness and synthetic manifests.
const fs=require('fs'),assert=require('assert/strict'),cp=require('child_process');
(async()=>{
 const cases=JSON.parse(fs.readFileSync('/tmp/teams-directory-d1-cases.json')),evidence={};const root='http://127.0.0.1:8796';
 const send=async(path,v)=>{const r=await fetch(root+path,{method:'POST',headers:{'Content-Type':'application/json','X-Teams-Synthetic-QA':'local-only'},body:JSON.stringify(v)});return {status:r.status,...await r.json()};};
 const seed=sql=>cp.execFileSync('npx',['wrangler','d1','execute','teams-security-local','--config','wrangler.worker.jsonc','--local','--persist-to','/tmp/teams-directory-d1-state','--command',sql],{stdio:'pipe'});
 const a=cases.resume;for(const environment of ['preview','production'])assert.equal((await send('/commit',{...a,environment})).status,409);const tampered=JSON.parse(JSON.stringify(a));tampered.plan.changes[0].after.display_name='Tampered';assert.match((await send('/commit',tampered)).error,/Manifest changed/);
 const partial=await send('/commit',{...a,interruptAfterRecord:1});assert.match(partial.error,/Synthetic interruption/);
 const resumed=await send('/commit',a);assert.equal(resumed.status,200,JSON.stringify(resumed));assert.equal((await send('/commit',a)).duplicate,true);
 const undoPartial=await send('/undo',{batchId:a.batchId,interruptAfterRecord:1});assert.match(undoPartial.error,/Synthetic undo interruption/);
 assert.match((await send('/commit',a)).error,/undo has started/);
 const undoResume=await send('/undo',{batchId:a.batchId});assert.equal(undoResume.undone,true,JSON.stringify(undoResume));assert.equal((await send('/undo',{batchId:a.batchId})).duplicate,true);
 evidence.resume={interruption:partial.error,resumed,rerun:'zero duplicate writes',undoInterrupted:undoPartial.error,undoResumed:undoResume,commitAfterUndo:'blocked'};
 const b=cases.stale;assert.equal((await send('/commit',b)).status,200);const tenantId=b.plan.changes.find(c=>c.table==='tenant_accounts').id;
 // Simulate a later staff edit, with its required revision advance.
 seed("UPDATE operations_tenants SET revision=revision+1,internal_notes='Synthetic later edit' WHERE tenant_id='"+tenantId+"'");
 const stale=await send('/undo',{batchId:b.batchId});assert.match(stale.error,/Later edit/);evidence.stale={undo:'blocked; later edit preserved'};
 const used=cases.later_use;assert.equal((await send('/commit',used)).status,200);const usedTenant=used.plan.changes.find(c=>c.table==='tenant_accounts').id;assert(/^[0-9a-f-]{36}$/.test(usedTenant));seed("INSERT INTO tenant_sessions(token_hash,tenant_id,expires_at) VALUES('qa-later-use-"+usedTenant+"','"+usedTenant+"',datetime('now','+1 day'))");const useUndo=await send('/undo',{batchId:used.batchId});assert.match(useUndo.error,/Later operational use/);evidence.laterUse={undo:'blocked; later operational history retained'};
 const c=cases.audit_failure;seed("CREATE TRIGGER qa_import_audit_failure BEFORE INSERT ON tenant_import_changes BEGIN SELECT RAISE(ABORT,'QA forced audit failure'); END");
 let failed;try{failed=await send('/commit',c);assert.equal(failed.status,409);assert.match(failed.error,/QA forced audit failure/);}finally{seed('DROP TRIGGER qa_import_audit_failure');}
 const recovered=await send('/commit',c);assert.equal(recovered.status,200,JSON.stringify(recovered));const finalUndo=await send('/undo',{batchId:c.batchId});assert.equal(finalUndo.undone,true,JSON.stringify(finalUndo));
 evidence.auditFailure={failure:'D1 batch aborted on audit insert',resumed:recovered,undo:'passed'};
 fs.writeFileSync('/tmp/teams-directory-d1-import-evidence.json',JSON.stringify(evidence,null,2));console.log(JSON.stringify(evidence));
})().catch(e=>{console.error(e.stack);process.exit(1)});
