#!/usr/bin/env node
// Stage a gateway without copying guarded D1 photo derivatives or private files.
// Usage: node scripts/gateway/stage-public-assets.cjs <OpenNext assets> <output>
const fs=require('node:fs'),path=require('node:path');
const [source,output]=process.argv.slice(2);
if(!source||!output)throw Error('Expected OpenNext assets and disposable gateway output');
const input=path.resolve(source),out=path.resolve(output);
if(out===input||out.startsWith(input+path.sep)||input.startsWith(out+path.sep))throw Error('Use separate staging and asset directories');
if(fs.existsSync(out)&&fs.readdirSync(out).length)throw Error('Output must be empty to avoid retaining private or stale files');
fs.mkdirSync(out,{recursive:true});
for(const relative of ['_next/static','images','brand','documents/news']){
 const from=path.join(input,relative);if(!fs.existsSync(from))continue;
 fs.cpSync(from,path.join(out,relative),{recursive:true,filter:p=>{if(fs.lstatSync(p).isSymbolicLink())throw Error('Asset symlinks are not permitted');return true;}});
}
for(const name of ['_worker.js','_routes.json'])fs.copyFileSync(path.join(__dirname,'../../deployment/preview-gateway',name),path.join(out,name));
console.log('Public-only gateway staged; guarded photo derivatives excluded.');

// Logo derivatives are public brand assets, independent of the private runtime bundle.
const crypto=require('node:crypto');
const photos=JSON.parse(fs.readFileSync(path.join(__dirname,'../../src/lib/generated/photo-variants.json'),'utf8'));
const logo=photos.find(photo=>photo.originalSrc==='/brand/teams-management-gold-emblem.png');
if(!logo||logo.kind==='media')throw Error('Expected public gold emblem manifest');
for(const variant of logo.variants){
 const bytes=fs.readFileSync(path.join(__dirname,'../../generated/photo-variants/public',variant.file));
 if(crypto.createHash('sha256').update(bytes).digest('hex')!==variant.sha256)throw Error('Logo derivative checksum mismatch');
 const destination=path.join(out,'brand/variants',variant.file);
 fs.mkdirSync(path.dirname(destination),{recursive:true});fs.writeFileSync(destination,bytes);
}
console.log(`Staged ${logo.variants.length} verified public logo derivatives.`);
