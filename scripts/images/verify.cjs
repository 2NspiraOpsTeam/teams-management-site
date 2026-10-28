const fs=require('node:fs'),path=require('node:path'),{createRequire}=require('node:module');
const sharp=createRequire(require.resolve('next/package.json'))('sharp');sharp.concurrency(2);sharp.cache(false);
(async()=>{const records=JSON.parse(fs.readFileSync('src/lib/generated/photo-variants.json'));let checked=0;
for(const photo of records)for(const v of photo.variants){const file=path.join('generated/photo-variants',photo.kind==='media'?'private':'public',v.file);const image=sharp(file);const m=await image.metadata();if(m.width!==v.width||m.height!==v.height||m.format!=='webp')throw Error('Rendition metadata mismatch');await image.raw().toBuffer();checked++;}
console.log(JSON.stringify({decoded:checked,images:records.length,errors:0}));})().catch(e=>{console.error(e.message);process.exitCode=1;});
