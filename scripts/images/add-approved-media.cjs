#!/usr/bin/env node
// Append newly published media without changing existing assignments or originals.
const fs=require('node:fs'),path=require('node:path'),crypto=require('node:crypto'),{createRequire}=require('node:module');
const sharp=createRequire(require.resolve('next/package.json'))('sharp');
const args=process.argv.slice(2),i=args.indexOf('--inventory');
if(i<0||!args[i+1])throw Error('Explicit private, publication-verified inventory required');
const input=JSON.parse(fs.readFileSync(args[i+1])),records=JSON.parse(fs.readFileSync('src/lib/generated/photo-variants.json'));
const sha=b=>crypto.createHash('sha256').update(b).digest('hex');
(async()=>{for(const asset of input.assets){
 if(asset.visibility!=='public'||asset.publicationVerified!==true)throw Error('Public publication verification required');
 if(records.some(p=>p.kind==='media'&&p.id===asset.id))throw Error('Existing media must not be overwritten');
 const raw=fs.readFileSync(asset.source_file);if(sha(raw)!==asset.checksum)throw Error('Original source checksum mismatch');
 const meta=await sharp(raw).metadata();if(!meta.width||!meta.height)throw Error('Invalid source image');
 const swapped=[5,6,7,8].includes(meta.orientation),w=swapped?meta.height:meta.width,h=swapped?meta.width:meta.height;
 const record={kind:'media',id:asset.id,originalSrc:asset.original_url,storageKey:asset.storage_key,assetChecksum:asset.checksum,sourceSha256:sha(raw),originalWidth:w,originalHeight:h,originalBytes:raw.length,upscaled:false,cover:Boolean(asset.cover),variants:[]};
 for(const width of [...new Set([160,480,960,1600,2400,w].filter(v=>v<=w))].sort((a,b)=>a-b)){
  const {data,info}=await sharp(raw).rotate().resize({width,kernel:'lanczos3'}).webp({quality:width<=960?78:88,effort:6,smartSubsample:true}).toBuffer({resolveWithObject:true});
  const digest=sha(data),file=digest+'.webp';fs.writeFileSync(path.join('generated/photo-variants/private',file),data);
  record.variants.push({width:info.width,height:info.height,bytes:data.length,file,sha256:digest});
 }
 records.push(record);console.log(JSON.stringify({id:record.id,originalBytes:record.originalBytes,variants:record.variants.map(v=>({width:v.width,bytes:v.bytes}))}));
 }fs.writeFileSync('src/lib/generated/photo-variants.json',JSON.stringify(records));require('./delivery-manifest.cjs').write();
})().catch(e=>{console.error(e.message);process.exitCode=1;});
