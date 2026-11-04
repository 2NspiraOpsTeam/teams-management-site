#!/usr/bin/env node
// Offline delivery optimization of the public covers and static image renditions identified by PageSpeed.
// Read original approved sources only; retain larger renditions and original bytes.
const fs=require('node:fs'),path=require('node:path'),crypto=require('node:crypto'),{createRequire}=require('node:module');
const sharp=createRequire(require.resolve('next/package.json'))('sharp');
const args=process.argv.slice(2),index=args.indexOf('--inventory');
if(index<0||!args[index+1])throw Error('Explicit private approved-public-media inventory required');
const inventory=JSON.parse(fs.readFileSync(args[index+1]));
const records=JSON.parse(fs.readFileSync('src/lib/generated/photo-variants.json'));
const targets=new Set(['gold-preview-08','cf615cdf-f28c-4767-86e3-67624258c593','dining-delizia-client-pizza-03','/residential-discovery.jpg','/brand/teams-management-gold-emblem.png']);
const sha=b=>crypto.createHash('sha256').update(b).digest('hex');
(async()=>{
 const changes=[];
 for(const photo of records){
  if(!photo.cover&&photo.kind!=='static'&&!targets.has(photo.id)&&!targets.has(photo.originalSrc))continue;
  const source=photo.kind==='media'?inventory.assets.find(a=>a.id===photo.id)?.source_file:path.join('public',photo.originalSrc);
  if(!source)throw Error('Missing approved source '+photo.id);
  const raw=fs.readFileSync(source);
  if(sha(raw)!==photo.sourceSha256)throw Error('Source checksum changed '+photo.id);
  const logo=photo.originalSrc.includes('/brand/');
  const widths=logo?[72,144,216,...photo.variants.filter(v=>v.width<=960).map(v=>v.width)]:photo.variants.filter(v=>v.width<=960).map(v=>v.width);
  for(const width of [...new Set(widths)].sort((a,b)=>a-b)){
   const old=photo.variants.find(v=>v.width===width);
   const {data,info}=await sharp(raw).rotate().resize({width,kernel:'lanczos3'}).webp({quality:logo?90:78,alphaQuality:100,effort:6,smartSubsample:true}).toBuffer({resolveWithObject:true});
   if(old&&data.length>=old.bytes)continue;
   const digest=sha(data),file=digest+'.webp';
   fs.writeFileSync(path.join('generated/photo-variants',photo.kind==='media'?'private':'public',file),data);
   const variant={width:info.width,height:info.height,bytes:data.length,file,sha256:digest};
   photo.variants=photo.variants.filter(v=>v.width!==width).concat(variant).sort((a,b)=>a.width-b.width);
   changes.push({id:photo.id,width,before:old?.bytes,after:data.length});
  }
 }
 fs.writeFileSync('src/lib/generated/photo-variants.json',JSON.stringify(records));
 require('./delivery-manifest.cjs').write();
 console.log(JSON.stringify(changes,null,2));
})().catch(e=>{console.error(e.message);process.exitCode=1});
