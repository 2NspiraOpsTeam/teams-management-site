import {PublicClientApplication,InteractionRequiredAuthError} from '@azure/msal-browser';
export type PickerConfig={clientId:string;tenantId:string;baseUrl:string;enabled:boolean};
export type PickedPdf={name:string;webUrl:string;driveId:string;itemId:string};
/** Tokens stay in browser memory. No download, upload, createLink, or sharing calls. */
export async function pickOneDrivePdf(config:PickerConfig,signal:AbortSignal):Promise<PickedPdf|null>{
 const win=window.open('','TeamsOneDrivePicker','width=1080,height=680');if(!win)throw Error('Allow pop-ups for this site, then try again.');
 const base=new URL(config.baseUrl),channelId=crypto.randomUUID();
 const app=new PublicClientApplication({auth:{clientId:config.clientId,authority:'https://login.microsoftonline.com/'+config.tenantId,redirectUri:location.origin+'/onedrive-callback'},cache:{cacheLocation:'memoryStorage'}});
 try{await app.initialize();
 const token=async(resource:string)=>{const origin=new URL(resource).origin;if(origin!==base.origin)throw Error('Microsoft requested an unsupported resource.');const req={scopes:[origin+'/MyFiles.Read'],account:app.getActiveAccount()||undefined};try{return (await app.acquireTokenSilent(req)).accessToken;}catch(e){if(!(e instanceof InteractionRequiredAuthError)&&app.getActiveAccount())throw e;const result=await app.acquireTokenPopup(req);app.setActiveAccount(result.account);return result.accessToken;}};
 const initialToken=await token(base.origin);if(signal.aborted){win.close();return null;}
 return await new Promise<PickedPdf|null>((resolve,reject)=>{
 let port:MessagePort|undefined,done=false,picking=false;
 const cleanup=()=>{done=true;clearInterval(closed);clearTimeout(timeout);window.removeEventListener('message',init);signal.removeEventListener('abort',cancel);port?.close();win.close();};
 const finish=(v:PickedPdf|null)=>{cleanup();resolve(v);};const cancel=()=>finish(null);
 const closed=setInterval(()=>{if(win.closed)finish(null);},500);const timeout=setTimeout(()=>{cleanup();reject(Error('Microsoft file selection timed out. Try again.'));},10*60*1000);
 const init=(event:MessageEvent)=>{if(event.source!==win||event.origin!==base.origin||event.data?.type!=='initialize'||event.data.channelId!==channelId||!event.ports[0]||done)return;port?.close();port=event.ports[0];const activePort=port;
 activePort.onmessage=async(event:MessageEvent)=>{const payload=event.data;if(payload?.type!=='command'||done)return;activePort.postMessage({type:'acknowledge',id:payload.id});const c=payload.data;const result=(data:unknown)=>activePort.postMessage({type:'result',id:payload.id,data});try{
 if(c.command==='authenticate'){result({result:'token',token:await token(c.resource)});}
 else if(c.command==='close'){result({result:'success'});finish(null);}
 else if(c.command==='pick'){if(picking){result({result:'error',error:{code:'unusableItem',message:'Selection is already being processed.'}});return;}picking=true;try{if(c.items?.length!==1)throw Error('Choose one PDF.');const item=c.items[0];const driveId=item.parentReference?.driveId,itemId=item.id;if(typeof driveId!=='string'||typeof itemId!=='string')throw Error('Microsoft did not return file details.');
 // Resolve permanent metadata from the configured Microsoft origin, never a supplied endpoint.
 const endpoint=base.origin+'/_api/v2.0/drives/'+encodeURIComponent(driveId)+'/items/'+encodeURIComponent(itemId)+'?$select=id,name,webUrl,file';
 const response=await fetch(endpoint,{headers:{Authorization:'Bearer '+await token(base.origin)}});if(!response.ok)throw Error('Could not read the selected PDF. Check Microsoft permissions and try again.');const f=await response.json();if(!f.file||!f.name?.toLowerCase().endsWith('.pdf'))throw Error('Choose a PDF document.');const u=new URL(f.webUrl);const tenant=base.hostname.replace('-my.sharepoint.com','');if(u.protocol!=='https:'||![tenant+'.sharepoint.com',base.hostname].includes(u.hostname)||u.search||u.hash)throw Error('Microsoft did not return a permanent file link.');result({result:'success'});finish({name:f.name,webUrl:u.href,driveId,itemId});}finally{picking=false;}}
 else result({result:'error',error:{code:'unsupportedCommand',message:'This action is not available.'}});
 }catch{result({result:'error',error:{code:'unusableItem',message:'Unable to use this file. Select a PDF from your connected OneDrive and check Microsoft access.'}});}};
 activePort.start();activePort.postMessage({type:'activate'});};
 window.addEventListener('message',init);signal.addEventListener('abort',cancel,{once:true});if(signal.aborted){cancel();return;}
 const options={sdk:'8.0',entry:{oneDrive:{}},authentication:{tokens:{graph:false,sharePoint:true}},messaging:{origin:location.origin,channelId},selection:{mode:'single'},typesAndSources:{mode:'files',filters:['.pdf'],locations:{oneDrive:{}},pivots:{oneDrive:true,recent:true,shared:false,sharedLibraries:false}},commands:{pick:{action:'select',label:'Use this PDF',select:{urls:{download:false}}},upload:{enabled:false},createFolder:{enabled:false},browseThisDevice:{enabled:false},switchAccount:{mode:'none'},manageAccounts:{mode:'none'}}};
 const form=win.document.createElement('form');form.method='POST';form.action=base.origin+'/_layouts/15/FilePicker.aspx?'+new URLSearchParams({filePicker:JSON.stringify(options),locale:'en-us'});const input=win.document.createElement('input');input.type='hidden';input.name='access_token';input.value=initialToken;form.append(input);win.document.body.append(form);form.submit();
 });
 }catch{win.close();throw Error('Microsoft connection could not be completed. Check sign-in, consent, and pop-up permissions, then try again.');}finally{app.clearCache().catch(()=>undefined);}
}
