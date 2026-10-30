#!/usr/bin/env node
// Read-only bounded photo gate. Exact prepared bytes, never login or mutations.
const fs=require('node:fs'),crypto=require('node:crypto');
function probes(photos){return photos.map(p=>{const v=p.variants.at(-1);return {path:p.kind==='media'?`/api/media/${encodeURIComponent(p.id)}?v=${p.sourceSha256}&w=${v.width}`:`/photo-variants/${v.file}`,sha256:v.sha256,bytes:v.bytes};});}
async function check(origin,probe,release,fetcher=fetch){
 const url=new URL(probe.path,origin);if(url.origin!==new URL(origin).origin)throw Error('Unsafe image origin');
 const r=await fetcher(url,{redirect:'manual',signal:AbortSignal.timeout(20000)});
 if(r.status!==200||!r.headers.get('content-type')?.startsWith('image/'))throw Error(`Photo HTTP/content failure (${r.status})`);
 if(release&&(probe.path.startsWith('/api/media/')||r.headers.has('x-teams-release'))&&r.headers.get('x-teams-release')!==release)throw Error('Photo release mismatch');
 const data=Buffer.from(await r.arrayBuffer());
 if(data.length!==probe.bytes||crypto.createHash('sha256').update(data).digest('hex')!==probe.sha256)throw Error('Photo byte/checksum mismatch');
 return true;
}
module.exports={probes,check};
if(require.main===module)(async()=>{
 const [origin,release]=process.argv.slice(2);if(!origin||!release)throw Error('Expected origin and release');
 const photos=JSON.parse(fs.readFileSync('src/lib/generated/photo-variants.json'));let passed=0;const failed=[];
 for(const p of probes(photos)){try{await check(origin,p,release);passed++;}catch(e){failed.push({path:p.path,error:e.message});}}
 console.log(JSON.stringify({passed,total:photos.length,failed}));if(failed.length)process.exitCode=1;
})().catch(e=>{console.error(e.message);process.exitCode=1;});
