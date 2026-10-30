import {expect,it} from 'vitest';
import {createRequire} from 'node:module';
import {mkdtempSync,mkdirSync,writeFileSync,rmSync} from 'node:fs';
import {tmpdir} from 'node:os';
import {join} from 'node:path';
import {createHash} from 'node:crypto';
const require=createRequire(import.meta.url),{verify}=require('../scripts/images/assert-staged.cjs'),{check}=require('../scripts/images/live-gate.cjs');
it('blocks a missing or corrupted guarded rendition even when public assets exist',()=>{
 const root=mkdtempSync(join(tmpdir(),'photo-gate-'));try{
 mkdirSync(join(root,'src/lib/generated'),{recursive:true});mkdirSync(join(root,'.open-next/assets/_photo-variants'),{recursive:true});
 const data=Buffer.from('prepared'),sha=createHash('sha256').update(data).digest('hex');
 writeFileSync(join(root,'src/lib/generated/photo-variants.json'),JSON.stringify([{kind:'media',variants:[{file:'test.webp',bytes:data.length,sha256:sha}]}]));
 expect(()=>verify(root)).toThrow('missing prepared');writeFileSync(join(root,'.open-next/assets/_photo-variants/test.webp'),'corrupt');expect(()=>verify(root)).toThrow('corrupt prepared');
 writeFileSync(join(root,'.open-next/assets/_photo-variants/test.webp'),data);expect(verify(root)).toBe(1);
 }finally{rmSync(root,{recursive:true,force:true});}
});
it('rejects unavailable images, login HTML, wrong releases and wrong bytes',async()=>{
 const data='prepared',p={path:'/api/media/fixture?w=480',bytes:data.length,sha256:createHash('sha256').update(data).digest('hex')};
 const respond=(body:string,status=200,type='image/webp',release='current')=>async()=>new Response(body,{status,headers:{'content-type':type,'x-teams-release':release}});
 await expect(check('https://site.test',p,'current',respond(data))).resolves.toBe(true);
 for(const fetcher of [respond('unavailable',503),respond('login',200,'text/html'),respond(data,200,'image/webp','old'),respond('wrong')])await expect(check('https://site.test',p,'current',fetcher)).rejects.toThrow();
});
