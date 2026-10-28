#!/usr/bin/env node
// Offline, zero-service-cost photography derivatives using Next's pinned Sharp/libvips.
// Input is a PRIVATE approved-public-media inventory; never pass private/tenant photos.
// Originals remain untouched. This is deterministic resampling, NOT detail synthesis.
const fs=require('node:fs'),path=require('node:path'),crypto=require('node:crypto'),{createRequire}=require('node:module');
const sharp=createRequire(require.resolve('next/package.json'))('sharp');sharp.concurrency(2);sharp.cache({memory:64});
const sha=b=>crypto.createHash('sha256').update(b).digest('hex');
const args=process.argv.slice(2),inventory=args[args.indexOf('--inventory')+1];if(!args.includes('--inventory'))throw Error('Explicit private public-media inventory required');
const root=process.cwd(),out=path.join(root,'generated/photo-variants');
function walk(dir){return fs.readdirSync(dir,{withFileTypes:true}).flatMap(e=>e.isDirectory()?walk(path.join(dir,e.name)):[path.join(dir,e.name)]);}
(async()=>{
 const input=JSON.parse(fs.readFileSync(inventory));if(input.missing?.length)throw Error('Reconcile missing source files before generating');
 const entries=input.assets.map(a=>({kind:'media',id:a.id,originalSrc:a.original_url,storageKey:a.storage_key,assetChecksum:a.checksum,sourceFile:a.source_file,cover:Boolean(a.cover)}));
 const mapped=new Set(entries.map(e=>e.originalSrc));
 for(const file of walk(path.join(root,'public'))){const src='/'+path.relative(path.join(root,'public'),file).split(path.sep).join('/');if(!/\.(jpe?g|png|webp)$/i.test(file)||mapped.has(src))continue;entries.push({kind:'static',id:sha(src).slice(0,20),originalSrc:src,sourceFile:file,cover:false});}
 const result=[];let generated=0,bytes=0;
 for(const [index,e] of entries.entries()){
  const raw=fs.readFileSync(e.sourceFile),meta=await sharp(raw).metadata();
  if(!meta.width||!meta.height)throw Error('Undecodable public image '+e.id);
  const swapped=[5,6,7,8].includes(meta.orientation),w=swapped?meta.height:meta.width,h=swapped?meta.width:meta.height;
  const long=Math.max(w,h),target=e.cover?Math.min(3200,long*4):Math.min(Math.max(long,2048),long*2,3200);
  const maxWidth=Math.round(w*Math.max(1,target/long));
  const widths=[...new Set([160,480,960,1600,Math.min(2400,maxWidth),maxWidth].filter(v=>v<=maxWidth))].sort((a,b)=>a-b);
  const record={kind:e.kind,id:e.id,originalSrc:e.originalSrc,...(e.kind==='media'?{storageKey:e.storageKey,assetChecksum:e.assetChecksum}:{}),sourceSha256:sha(raw),originalWidth:w,originalHeight:h,originalBytes:raw.length,upscaled:target>long,cover:e.cover,variants:[]};
  for(const width of widths){
   const enlarge=width>w;
   let pipeline=sharp(raw).rotate().resize({width,kernel:'lanczos3',fit:'inside'});
   // Mild edge definition only on enlarged copies: no denoising, relighting,
   // geometry changes, text reconstruction, content replacement or AI inference.
   if(enlarge)pipeline=pipeline.sharpen({sigma:0.6,m1:0.4,m2:1.2});
   const logo=e.originalSrc.includes('/brand/');
   const {data,info}=await pipeline.webp(logo?{lossless:true,effort:6}:{quality:88,effort:5,smartSubsample:true}).toBuffer({resolveWithObject:true});
   const digest=sha(data),group=e.kind==='media'?'private':'public',file=digest+'.webp';fs.mkdirSync(path.join(out,group),{recursive:true});fs.writeFileSync(path.join(out,group,file),data);
   record.variants.push({width:info.width,height:info.height,bytes:info.size,file,sha256:digest});generated++;bytes+=data.length;
  }
  result.push(record);
  if((index+1)%25===0)console.log(`Prepared ${index+1}/${entries.length} approved images`);
 }
 fs.writeFileSync(path.join(root,'src/lib/generated/photo-variants.json'),JSON.stringify(result));
 const summary={images:result.length,media:result.filter(e=>e.kind==='media').length,static:result.filter(e=>e.kind==='static').length,covers:result.filter(e=>e.cover).length,upscaled:result.filter(e=>e.upscaled).length,variants:generated,totalBytes:bytes,originalBytes:result.reduce((n,e)=>n+e.originalBytes,0),tools:'Sharp/libvips, local CPU only; zero API/service calls',fidelity:'Unmodified originals retained; interpolation does not recover true missing detail'};
 fs.writeFileSync(path.join(out,'summary.json'),JSON.stringify(summary,null,2));console.log(JSON.stringify(summary));
})().catch(e=>{console.error(e.message);process.exitCode=1;});
