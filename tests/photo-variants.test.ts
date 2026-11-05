import {afterEach,expect,it,vi} from 'vitest';
import photos from '../src/lib/generated/photo-variants.json';
import {readFileSync,existsSync} from 'node:fs';
import {createHash} from 'node:crypto';
afterEach(()=>{vi.unstubAllEnvs();vi.resetModules();});
it('prepares every inventoried public photo with distinct bounded renditions and matching stored checksums',()=>{
 expect(photos.length).toBe(294);expect(photos.filter(p=>p.cover)).toHaveLength(38);
 for(const p of photos){
  expect(new Set(p.variants.map(v=>v.width)).size).toBe(p.variants.length);
  expect(p.variants.map(v=>v.width)).toEqual([...p.variants.map(v=>v.width)].sort((a,b)=>a-b));
  for(const v of p.variants){const file=`generated/photo-variants/${p.kind==='media'?'private':'public'}/${v.file}`;expect(existsSync(file)).toBe(true);const data=readFileSync(file);expect(data.length).toBe(v.bytes);expect(createHash('sha256').update(data).digest('hex')).toBe(v.sha256);expect(Math.abs(v.width/v.height-p.originalWidth/p.originalHeight)).toBeLessThan(0.03);}
 }
});
it('gives browsers responsive choices without transforming unknown/private sources',async()=>{
 vi.stubEnv('NEXT_PUBLIC_PREVIEW_PORTFOLIO','1');const {photoAttributes,requestedMediaVariant,variantMatchesSource}=await import('../src/lib/photo-variants');
 const p=photos.find(p=>p.kind==='media')!;const delivered=photoAttributes(p.originalSrc,'80px');expect(delivered.srcSet).toContain('w=160');expect(delivered.sizes).toBe('80px');
 const v=p.variants[0];expect(requestedMediaVariant(p.id,p.sourceSha256,v.width)).not.toBeNull();expect(requestedMediaVariant(p.id,'wrong',v.width)).toBeNull();expect(requestedMediaVariant(p.id,p.sourceSha256,9999)).toBeNull();
 expect(variantMatchesSource(p,{storage_key:p.storageKey!,checksum:p.assetChecksum!})).toBe(true);expect(variantMatchesSource(p,{storage_key:p.storageKey!,checksum:'changed'})).toBe(false);
 expect(photoAttributes('/api/tenant/maintenance/photos/private')).toEqual({src:'/api/tenant/maintenance/photos/private'});
});
it('keeps preview-derived media out of the normal production consumer',async()=>{
 vi.stubEnv('NEXT_PUBLIC_PREVIEW_PORTFOLIO','0');const {photoAttributes,requestedMediaVariant}=await import('../src/lib/photo-variants');const p=photos[0];expect(photoAttributes(p.originalSrc)).toEqual({src:p.originalSrc});expect(requestedMediaVariant(p.id,p.sourceSha256,p.variants[0].width)).toBeNull();
});

it('delivers the selected Gold Street cover responsively without enlarging or changing its original',()=>{
 const gold=photos.find(p=>p.id==='4deb0e16-9f65-45a1-bd6d-f71743ad773d')!;
 expect(gold.originalBytes).toBe(552345);expect(gold.upscaled).toBe(false);
 expect(gold.variants.every(v=>v.width<=gold.originalWidth)).toBe(true);
 expect(gold.variants.find(v=>v.width===480)!.bytes).toBeLessThan(50000);
 expect(gold.variants.at(-1)!.bytes).toBeLessThan(gold.originalBytes/2);
});
