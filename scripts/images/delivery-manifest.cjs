// Browser delivery needs URLs and widths, not server authorization/checksum metadata.
const fs=require('node:fs');
function generate(records){return Object.fromEntries(records.map(photo=>[photo.originalSrc,{
 prefix:photo.kind==='media'?`/api/media/${encodeURIComponent(photo.id)}?v=${photo.sourceSha256}&w=`:'/photo-variants/',
 widths:photo.variants.map(v=>v.width),
 ...(photo.kind==='media'?{}:{files:photo.variants.map(v=>v.file)}),
}]));}
function write(){fs.writeFileSync('src/lib/generated/photo-delivery.json',JSON.stringify(generate(JSON.parse(fs.readFileSync('src/lib/generated/photo-variants.json')))));}
module.exports={generate,write};
if(require.main===module)write();
