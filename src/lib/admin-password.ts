import { scrypt, timingSafeEqual } from 'node:crypto';
// Built-in, Workers-supported scrypt. OWASP's N=2^15,r=8,p=3 profile keeps
// memory at ~32 MiB per derivation; no third-party authentication dependency.
const cost=32768,blockSize=8,parallel=3;
export const randomSession=()=>Array.from(crypto.getRandomValues(new Uint8Array(32)),b=>b.toString(16).padStart(2,'0')).join('');
export function passwordError(value:unknown):string|null {
 return typeof value!=='string'||value.length<14||value.length>128?'Use a password between 14 and 128 characters. Spaces are welcome.':null;
}
function derive(password:string,salt:string):Promise<Buffer> {
 return new Promise((resolve,reject)=>scrypt(password,salt,32,{N:cost,r:blockSize,p:parallel,maxmem:64*1024*1024},(error,key)=>error?reject(error):resolve(key)));
}
export async function encodePassword(password:string) {
 const salt=randomSession();
 return `scrypt$${cost}$${blockSize}$${parallel}$${salt}$${(await derive(password,salt)).toString('hex')}`;
}
const dummy=`scrypt$${cost}$${blockSize}$${parallel}$${'0'.repeat(64)}$${'0'.repeat(64)}`;
export async function verifyPassword(password:string,encoded:string|null) {
 const parts=(encoded||dummy).split('$');
 if(parts.length!==6||parts[0]!=='scrypt'||parts[1]!==String(cost)||parts[2]!==String(blockSize)||parts[3]!==String(parallel)||!/^[0-9a-f]{64}$/.test(parts[4])||!/^[0-9a-f]{64}$/.test(parts[5]))return false;
 const candidate=await derive(password,parts[4]);
 return timingSafeEqual(candidate,Buffer.from(parts[5],'hex'))&&!!encoded;
}
