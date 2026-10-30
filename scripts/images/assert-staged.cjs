#!/usr/bin/env node
// Fail closed before upload: both public and guarded derivatives must match.
const fs=require('node:fs'),path=require('node:path'),crypto=require('node:crypto');
function verify(root=process.cwd(),assetRoot=path.join(root,'.open-next/assets')){
 const photos=JSON.parse(fs.readFileSync(path.join(root,'src/lib/generated/photo-variants.json')));let count=0;
 for(const photo of photos)for(const v of photo.variants){
  const file=path.join(assetRoot,photo.kind==='media'?'_photo-variants':'photo-variants',v.file);
  if(!fs.existsSync(file))throw Error('Release blocked: missing prepared photograph '+v.file);
  const data=fs.readFileSync(file);
  if(data.length!==v.bytes||crypto.createHash('sha256').update(data).digest('hex')!==v.sha256)throw Error('Release blocked: corrupt prepared photograph '+v.file);
  count++;
 }
 return count;
}
module.exports={verify};
if(require.main===module)console.log(`Photo artifact gate passed: ${verify()} checksum-verified renditions.`);
