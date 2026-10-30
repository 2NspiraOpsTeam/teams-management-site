const fs=require('node:fs'),path=require('node:path'),crypto=require('node:crypto');
const root=process.cwd(),records=JSON.parse(fs.readFileSync(path.join(root,'src/lib/generated/photo-variants.json')));
let count=0;
for(const photo of records)for(const variant of photo.variants){const group=photo.kind==='media'?'private':'public',source=path.join(root,'generated/photo-variants',group,variant.file),destination=path.join(root,'.open-next/assets',group==='private'?'_photo-variants':'photo-variants',variant.file);const bytes=fs.readFileSync(source);if(crypto.createHash('sha256').update(bytes).digest('hex')!==variant.sha256)throw Error('Derivative checksum mismatch');fs.mkdirSync(path.dirname(destination),{recursive:true});fs.copyFileSync(source,destination);count++;}
console.log(`Staged ${count} checksum-verified photo variants; originals unchanged.`);

console.log(`Photo artifact gate passed: ${require('./assert-staged.cjs').verify()} renditions.`);
